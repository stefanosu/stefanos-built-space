export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "controllers-or-services-where-should-orchestration-live",
    title: "Controllers or Services: Where Should Orchestration Live?",
    excerpt:
      "Exploring a common architectural dilemma in Clean Architecture: should complex business logic live in controllers or a dedicated service layer? A practical look at the trade-offs while building a personal finance tracker.",
    content: `
# Controllers or Services: Where Should Orchestration Live?

## Where Should Complex Business Logic Live in Clean Architecture?

While building my personal finance tracker, I faced a common architectural dilemma: where should complex business logic live in Clean Architecture?

Specifically, when implementing features like 'create expense' - which needs to validate users, check accounts, verify categories, and create transactions - should this orchestration happen in the controller or a dedicated service layer? I wanted to make the 'right' choice, but realized the right choice depends on my specific constraints and priorities like team size, maintainability needs, and how much I value reusability.

This decision would directly impact how testable, maintainable, and scalable my application becomes - and it's a dilemma many developers face when applying Clean Architecture principles in real projects.

## Visualizing the Two Approaches

I'm a visual learner, so I sketched out both approaches to wrap my head around what I was actually deciding. The diagrams immediately clarified that this choice would determine whether complexity lived in my controller or got pushed down to a service layer.

Creating these diagrams helped me see the core trade-offs between the two approaches.

### Scenario A: Controller Orchestration

In Scenario A, where the controller coordinates all services directly:
- Controllers can become bloated with business logic
- Harder to test
- Potential code duplication across different endpoints
- However, it's slightly more efficient with fewer method calls
- Easier to debug with fewer layers

### Scenario B: Service Layer Orchestration

In Scenario B, the business logic is better separated from the controllers:
- Reduces duplication
- Makes testing easier
- Better reusability - I could use the same ExpenseService from different interfaces later
- More flexibility for changing business workflows in one place
- Though it adds a small performance overhead

## My Decision

As a solo developer, testability and clarity matter more to me than squeezing out performance. I'd rather centralize business logic now than untangle it later. So I'm leaning toward the service layer approach — cleaner boundaries, more flexibility. But I'm also staying open to change if the abstraction starts to feel like overkill.

Curious how others approach this — especially if you've built solo or in small teams. Where do you draw the line between controller and service?
    `,
    date: "2025-07-09",
    readTime: "4 min read",
    tags: ["Clean Architecture", "Software Design", ".NET"],
  },
  {
    slug: "testing-your-architecture-decisions",
    title: "Testing Your Architecture Decisions: How Service Layer Orchestration Changes Your Testing Strategy",
    excerpt:
      "Part 2 of my personal finance tracker series. Moving to service layer orchestration doesn't just change your code structure—it fundamentally changes your entire testing strategy. Here's what I learned.",
    content: `
# Testing Your Architecture Decisions: How Service Layer Orchestration Changes Your Testing Strategy

*Part 2 of my personal finance tracker development series*

In my previous post, I decided to move complex business logic from controllers into a dedicated service layer. The ExpenseService now handles the orchestration of validating users, checking accounts, verifying categories, and creating transactions.

I felt pretty good about this decision. Clean separation of concerns, better testability, more maintainable code—all the benefits I'd read about. But here's the thing: I hadn't actually tested it yet.

When I finally sat down to write tests for my new architecture, I quickly realized that moving to service layer orchestration doesn't just change your code structure. It fundamentally changes your entire testing strategy.

Some things got way easier. Others? Well, let's just say I learned some lessons the hard way.

## The "Easy Testing" Reality Check

My initial assumption was simple: "Great! Now my business logic is isolated in services, so testing will be straightforward."

Spoiler alert: It's more nuanced than that.

Don't get me wrong—the service layer approach definitely has testing advantages. But it also creates new challenges I didn't anticipate. Here's what I discovered as I worked through testing each layer.

## Controller Tests: Lighter Weight, But Still Critical

With business logic moved to services, I initially thought controller tests would be almost trivial. Just verify the HTTP plumbing works, right?

Turns out there's still important stuff to test here, but the focus completely shifted:

\`\`\`csharp
// ExpenseControllerTests.cs
[TestFixture]
public class ExpenseControllerTests
{
    private Mock<IExpenseService> _mockExpenseService;
    private ExpenseController _controller;

    [SetUp]
    public void SetUp()
    {
        _mockExpenseService = new Mock<IExpenseService>();
        _controller = new ExpenseController(_mockExpenseService.Object);
    }

    [Test]
    public async Task CreateExpense_ShouldCallExpenseServiceWithCorrectParameters()
    {
        // Arrange
        var request = new CreateExpenseRequest
        {
            Amount = 100,
            CategoryId = 1,
            AccountId = 1
        };

        var expectedResponse = new ExpenseResponse { Id = 1, Amount = 100 };
        _mockExpenseService.Setup(s => s.CreateExpenseAsync(It.IsAny<CreateExpenseCommand>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.CreateExpense(request);

        // Assert
        var okResult = result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        Assert.That(okResult.StatusCode, Is.EqualTo(201));

        _mockExpenseService.Verify(s => s.CreateExpenseAsync(It.Is<CreateExpenseCommand>(
            cmd => cmd.Amount == 100 && cmd.CategoryId == 1 && cmd.AccountId == 1
        )), Times.Once);
    }
}
\`\`\`

What I'm actually testing here:
- Request/response mapping (turns out this matters more than I thought)
- HTTP status codes and error handling
- Parameter transformation between web models and domain commands
- Authentication/authorization integration points

What I'm NOT testing: Any business logic—that's the service's responsibility now.

**The win:** These tests run super fast and don't break when I change business rules.

**The challenge:** I had to learn to resist the urge to test business logic at this layer.

## Service Tests: Where I Discovered the Real Value

This is where my architecture decision really started to pay off. Testing pure business logic without HTTP concerns felt... refreshing.

\`\`\`csharp
// ExpenseServiceTests.cs
[TestFixture]
public class ExpenseServiceTests
{
    private Mock<IUserRepository> _mockUserRepository;
    private Mock<IAccountRepository> _mockAccountRepository;
    private Mock<ICategoryRepository> _mockCategoryRepository;
    private Mock<ITransactionRepository> _mockTransactionRepository;
    private ExpenseService _expenseService;

    [SetUp]
    public void SetUp()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockAccountRepository = new Mock<IAccountRepository>();
        _mockCategoryRepository = new Mock<ICategoryRepository>();
        _mockTransactionRepository = new Mock<ITransactionRepository>();

        _expenseService = new ExpenseService(
            _mockUserRepository.Object,
            _mockAccountRepository.Object,
            _mockCategoryRepository.Object,
            _mockTransactionRepository.Object
        );
    }

    [Test]
    public async Task CreateExpenseAsync_WhenAllValidationsPass_ShouldCreateExpense()
    {
        // Arrange
        var command = new CreateExpenseCommand
        {
            Amount = 100,
            CategoryId = 1,
            AccountId = 1,
            UserId = 1
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Active = true });

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new Account { Id = 1, Balance = 1000 });

        _mockCategoryRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new Category { Id = 1, Active = true });

        _mockTransactionRepository.Setup(r => r.CreateAsync(It.IsAny<Transaction>()))
            .ReturnsAsync(new Transaction { Id = 1, Amount = 100 });

        // Act
        var result = await _expenseService.CreateExpenseAsync(command);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Amount, Is.EqualTo(100));
    }

    [Test]
    public async Task CreateExpenseAsync_WhenUserNotFound_ShouldThrowException()
    {
        // Arrange
        var command = new CreateExpenseCommand { UserId = 999 };

        _mockUserRepository.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((User)null);

        // Act & Assert
        var ex = Assert.ThrowsAsync<NotFoundException>(
            () => _expenseService.CreateExpenseAsync(command)
        );

        Assert.That(ex.Message, Is.EqualTo("User not found"));
    }

    [Test]
    public async Task CreateExpenseAsync_WhenInsufficientBalance_ShouldThrowException()
    {
        // Arrange
        var command = new CreateExpenseCommand
        {
            Amount = 100,
            AccountId = 1,
            UserId = 1
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Active = true });

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new Account { Id = 1, Balance = 50 });

        // Act & Assert
        var ex = Assert.ThrowsAsync<InsufficientBalanceException>(
            () => _expenseService.CreateExpenseAsync(command)
        );

        Assert.That(ex.Message, Is.EqualTo("Insufficient balance"));
    }
}
\`\`\`

What I love about this approach:
- Testing business logic without any HTTP noise
- Each test scenario is crystal clear
- Fast execution (no database, no network calls)
- Easy to test edge cases and error conditions

**The unexpected challenge:** Mock setup became more complex as my services grew. More dependencies meant more setup code.

## The Mock Management Problem I Didn't See Coming

Speaking of mocks, as I added more services, I realized I needed a better approach to mock management. Setting up 4-5 mocks for every test was getting tedious and error-prone.

Here's the helper that saved my sanity:

\`\`\`csharp
// TestHelpers/MockFactory.cs
public static class MockFactory
{
    public static (
        Mock<IUserRepository> userRepository,
        Mock<IAccountRepository> accountRepository,
        Mock<ICategoryRepository> categoryRepository,
        Mock<ITransactionRepository> transactionRepository
    ) CreateMockRepositories()
    {
        return (
            new Mock<IUserRepository>(),
            new Mock<IAccountRepository>(),
            new Mock<ICategoryRepository>(),
            new Mock<ITransactionRepository>()
        );
    }
}
\`\`\`

This factory pattern kept my test setup consistent, but I'm still not 100% satisfied with it. As my services grow, keeping these mocks in sync with actual interfaces becomes a maintenance burden.

## My Testing Strategy: The Pyramid in Practice

Here's how my testing strategy actually shook out:

**Unit Tests (70%)**
- Service layer business logic
- Individual validation rules
- Error handling scenarios
- Edge cases and boundary conditions

**Integration Tests (20%)**
- End-to-end API flows
- Database interaction patterns
- Cross-service communication
- Authentication/authorization flows

**Manual/Exploratory Tests (10%)**
- User experience validation
- Performance under load
- Error message quality
- Complex user scenarios

## What's Working vs. What's Still Challenging

**The wins:**
- Faster feedback loops - Unit tests run in milliseconds
- Better error testing - Easy to simulate failure scenarios
- Clearer test ownership - Each layer has distinct responsibilities
- Refactoring confidence - Business logic changes don't break HTTP tests

**The ongoing challenges:**
- Mock maintenance overhead - Keeping mocks aligned with interfaces
- Test data setup complexity - Creating realistic scenarios takes planning
- Integration gap risks - Sometimes unit tests pass but integration fails

## The Real Question: Was It Worth It?

Looking back at my testing experience, the service layer approach has made testing more focused and maintainable. I write more tests now (controller + service + integration), but each test is simpler and more reliable.

The key insight: architectural decisions don't just affect code organization—they fundamentally change your testing strategy. The service layer forced me to think more deliberately about test boundaries and responsibilities.

Would I make the same choice again? Absolutely. But I'd budget more time upfront for setting up proper test infrastructure and mock management patterns.

Building in public as a solo developer has its challenges, but the testing clarity from this architecture choice has been worth the extra setup. What's your take on the unit vs integration testing balance?
    `,
    date: "2025-07-16",
    readTime: "12 min read",
    tags: ["Testing", "Clean Architecture", ".NET", "Software Design"],
  },
  {
    slug: "integration-testing-patterns-that-actually-work",
    title: "Integration Testing Patterns That Actually Work",
    excerpt:
      "Part 3 of my personal finance tracker series. Unit tests give you confidence in your logic, but integration tests give you confidence in your system. Here are the patterns I developed after too many 'but it works in the tests!' incidents.",
    content: `
# Integration Testing Patterns That Actually Work

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
  },
];
