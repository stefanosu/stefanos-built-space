import { BlogPost } from "../types";

const post: BlogPost = {
  slug: "integration-testing-patterns-that-actually-work",
  title: "Integration Testing Patterns That Actually Work",
  excerpt:
    "Part 3 of my personal finance tracker series. Unit tests give you confidence in your logic, but integration tests give you confidence in your system. Here are the patterns I developed after too many 'but it works in the tests!' incidents.",
  content: `
*Part 3 of my personal finance tracker development series*

In my last post, I shared how moving to a service layer architecture transformed my testing strategy. The unit tests were clean, the mocks were... well, everywhere, and I felt pretty good about my 70% unit test coverage.

Then I deployed to staging.

Everything broke.

Not the logic—that worked fine. The database connections failed, the API contracts were misaligned, and my carefully mocked repository interfaces didn't match what the actual database was returning. Classic integration gap.

Here's what I learned: unit tests give you confidence in your logic, but integration tests give you confidence in your system. And after spending way too much time debugging "but it works in the tests!" issues, I've developed some integration testing patterns that actually work in the real world.

## The Integration Testing Reality Check

Let me start with the uncomfortable truth: most integration tests I see (including my early attempts) are either too simple to catch real issues or so complex they become maintenance nightmares.

The "happy path" integration test that just checks if the API returns 200? Useless.

The "test everything" integration test that sets up 47 database tables and mocks 12 external services? Unmaintainable.

What I needed was something in between—tests that validate real integration points without becoming a second application to maintain.

## Pattern 1: The Focused Integration Test

Instead of testing entire user workflows, I started focusing on specific integration boundaries. Here's how I test the service-to-repository integration:

\`\`\`csharp
[TestFixture]
public class ExpenseServiceIntegrationTests
{
    private TestContainer _container;
    private IServiceProvider _serviceProvider;
    private TestDatabaseContext _dbContext;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        _container = new TestcontainersBuilder<PostgreSqlTestcontainer>()
            .WithDatabase(new PostgreSqlTestcontainerConfiguration
            {
                Database = "testdb",
                Username = "test",
                Password = "test"
            })
            .Build();

        await _container.StartAsync();

        var services = new ServiceCollection();
        services.AddDbContext<TestDatabaseContext>(options =>
            options.UseNpgsql(_container.ConnectionString));

        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();

        _serviceProvider = services.BuildServiceProvider();
        _dbContext = _serviceProvider.GetRequiredService<TestDatabaseContext>();

        await _dbContext.Database.EnsureCreatedAsync();
    }

    [Test]
    public async Task CreateExpense_WithRealDatabase_ShouldPersistCorrectly()
    {
        // Arrange
        using var scope = _serviceProvider.CreateScope();
        var expenseService = scope.ServiceProvider.GetRequiredService<IExpenseService>();

        await SeedTestData();

        var command = new CreateExpenseCommand
        {
            Amount = 150.75m,
            CategoryId = 1,
            AccountId = 1,
            UserId = 1,
            Description = "Integration test expense"
        };

        // Act
        var result = await expenseService.CreateExpenseAsync(command);

        // Assert
        Assert.That(result.Id, Is.GreaterThan(0));
        Assert.That(result.Amount, Is.EqualTo(150.75m));

        // Verify actual database state
        var persistedExpense = await _dbContext.Expenses
            .Include(e => e.Category)
            .Include(e => e.Account)
            .FirstOrDefaultAsync(e => e.Id == result.Id);

        Assert.That(persistedExpense, Is.Not.Null);
        Assert.That(persistedExpense.Amount, Is.EqualTo(150.75m));
        Assert.That(persistedExpense.Category.Name, Is.EqualTo("Food"));

        // Verify side effects
        var updatedAccount = await _dbContext.Accounts.FindAsync(1);
        Assert.That(updatedAccount.Balance, Is.EqualTo(849.25m)); // 1000 - 150.75
    }
}
\`\`\`

What makes this work:
- Real database using Testcontainers (no more "works with InMemory but fails with PostgreSQL")
- Focused on one service boundary
- Tests actual persistence and relationships
- Verifies side effects (account balance update)

**The key insight:** Test one integration boundary deeply rather than many boundaries shallowly.

## Pattern 2: Contract Testing with Real Schemas

One of my biggest integration failures was schema mismatches. My mocked repositories returned perfectly shaped objects, but the real database had different column names, null constraints, and data types.

\`\`\`csharp
[TestFixture]
[Category("Contract")]
public class RepositoryContractTests
{
    private TestDatabaseContext _dbContext;
    private IUserRepository _userRepository;

    [SetUp]
    public async Task SetUp()
    {
        var options = new DbContextOptionsBuilder<TestDatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new TestDatabaseContext(options);
        _userRepository = new UserRepository(_dbContext);

        await _dbContext.Database.EnsureCreatedAsync();
    }

    [Test]
    public async Task GetByIdAsync_ShouldReturnUserWithExpectedShape()
    {
        // Arrange
        var expectedUser = new User
        {
            Id = 1,
            Name = "Test User",
            Email = "test@example.com",
            Active = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null // This matters - nullable fields need testing
        };

        _dbContext.Users.Add(expectedUser);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _userRepository.GetByIdAsync(1);

        // Assert - Verify exact contract
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(1));
        Assert.That(result.Name, Is.EqualTo("Test User"));
        Assert.That(result.Email, Is.EqualTo("test@example.com"));
        Assert.That(result.Active, Is.True);
        Assert.That(result.CreatedAt, Is.Not.EqualTo(default(DateTime)));
        Assert.That(result.UpdatedAt, Is.Null); // Explicitly test nullable behavior
    }

    [Test]
    public async Task CreateAsync_ShouldHandleAllFieldTypes()
    {
        // Arrange
        var user = new User
        {
            Name = "Test User with Special Chars: àáâãäå",
            Email = "test+tag@domain.co.uk",
            Active = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _userRepository.CreateAsync(user);

        // Assert
        Assert.That(result.Id, Is.GreaterThan(0));
        Assert.That(result.Name, Contains.Substring("àáâãäå")); // Unicode handling
        Assert.That(result.Email, Is.EqualTo("test+tag@domain.co.uk")); // Email format
        Assert.That(result.Active, Is.False); // Boolean handling
    }
}
\`\`\`

**The game changer:** Run these tests against your actual database schema in CI. If they pass with InMemory but fail with PostgreSQL, you've found a real issue.

## Pattern 3: Test Data Builders That Scale

Remember my painful mock setup from the last post? The same problem happens with integration test data, but worse—now you need valid foreign keys, proper relationships, and realistic data.

\`\`\`csharp
public class TestDataBuilder
{
    private readonly TestDatabaseContext _context;
    private readonly List<object> _entities = new();

    public TestDataBuilder(TestDatabaseContext context)
    {
        _context = context;
    }

    public TestDataBuilder WithUser(string name = "Test User", string email = null, bool active = true)
    {
        var user = new User
        {
            Id = _entities.OfType<User>().Count() + 1,
            Name = name,
            Email = email ?? \$"user{_entities.OfType<User>().Count() + 1}@test.com",
            Active = active,
            CreatedAt = DateTime.UtcNow
        };

        _entities.Add(user);
        return this;
    }

    public TestDataBuilder WithAccount(int userId, decimal balance = 1000m, string name = "Test Account")
    {
        var account = new Account
        {
            Id = _entities.OfType<Account>().Count() + 1,
            UserId = userId,
            Name = name,
            Balance = balance,
            CreatedAt = DateTime.UtcNow
        };

        _entities.Add(account);
        return this;
    }

    public async Task<TestDataBuilder> BuildAsync()
    {
        foreach (var entity in _entities)
        {
            _context.Add(entity);
        }

        await _context.SaveChangesAsync();
        return this;
    }
}

// Usage in tests
[Test]
public async Task CreateExpense_WithComplexRelationships_ShouldWork()
{
    var testData = await new TestDataBuilder(_dbContext)
        .WithUser("John Doe", "john@example.com")
        .WithAccount(userId: 1, balance: 500m, name: "Checking")
        .WithCategory("Groceries")
        .BuildAsync();

    var user = testData.Get<User>();
    var account = testData.Get<Account>();
    var category = testData.Get<Category>();

    // Now the test logic...
}
\`\`\`

Why this works better than fixtures:
- Fluent interface makes test intent clear
- Automatically handles relationships and foreign keys
- Easy to create variations for different test scenarios
- No hidden global state between tests

## The Testing Strategy That Actually Works

After working through these integration challenges, here's the testing approach I've landed on:

**Contract Tests (15% of integration tests)**
- Validate repository interfaces match database reality
- Test data type handling and constraints
- Fast feedback on schema changes

**Focused Integration Tests (70% of integration tests)**
- One service + its real dependencies
- Real database, isolated per test
- Deep validation of integration points

**Smoke Tests (15% of integration tests)**
- Critical user journeys end-to-end
- Minimal assertions, maximum coverage
- Run against production-like environment

## What I Learned the Hard Way

1. **Integration tests are not unit tests in disguise.** Don't try to test every edge case at the integration level. Use them to verify that your components actually work together.

2. **Real databases find real bugs.** InMemory databases are great for contract tests, but use real databases for integration tests. The SQL dialect differences will surprise you.

3. **Test data management is half the battle.** Invest in good test data builders early. Your future self will thank you.

4. **Parallel execution matters.** Design your integration tests to run in parallel from day one. Use database per test or isolated schemas.

5. **Clean up is crucial.** Docker containers, test databases, and temporary files add up quickly. Clean up in your CI pipeline.

## The Results: Confidence in Deployment

Since implementing these patterns, my "but it worked in tests!" incidents have dropped to near zero. More importantly, I can refactor with confidence knowing that if my integration tests pass, the system actually works.

My current test distribution:
- **Unit Tests (60%):** Business logic, validation, edge cases
- **Integration Tests (30%):** Service boundaries, database interactions, API contracts
- **End-to-End Tests (10%):** Critical user workflows, smoke tests

The integration tests take longer to run (about 2 minutes for the full suite), but they've prevented more production issues than any other testing investment I've made.

The journey from "works on my machine" to "works in production" is paved with good integration tests. These patterns have made that journey much smoother for my finance tracker project.
    `,
  date: "2025-07-23",
  readTime: "14 min read",
  tags: ["Testing", "Integration Testing", ".NET", "Software Design"],
};

export default post;
