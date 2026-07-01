import { BlogPost } from "../types";

const post: BlogPost = {
  slug: "controllers-or-services-where-should-orchestration-live",
  title: "Controllers or Services: Where Should Orchestration Live?",
  excerpt:
    "Exploring a common architectural dilemma in Clean Architecture: should complex business logic live in controllers or a dedicated service layer? A practical look at the trade-offs while building a personal finance tracker.",
  content: `
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
};

export default post;
