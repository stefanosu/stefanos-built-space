import { BlogPost } from "../types";

const post: BlogPost = {
  slug: "testing-your-architecture-decisions",
  title: "Testing Your Architecture Decisions: How Service Layer Orchestration Changes Your Testing Strategy",
  excerpt:
    "Part 2 of my personal finance tracker series. Moving to service layer orchestration doesn't just change your code structure—it fundamentally changes your entire testing strategy. Here's what I learned.",
  content: `
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
};

export default post;
