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
    slug: "clean-architecture-principles",
    title: "Clean Architecture Principles in Modern Web Development",
    excerpt: "Exploring how clean architecture principles can help us build more maintainable, testable, and scalable applications. This post covers separation of concerns, dependency inversion, and practical implementation strategies.",
    content: `
# Clean Architecture Principles in Modern Web Development

Clean architecture isn't just about organizing code—it's about creating systems that can evolve with your business needs while remaining maintainable and testable.

## Core Principles

### Separation of Concerns

The foundation of clean architecture lies in separating different aspects of your application:

- **Presentation Layer**: UI components and user interactions
- **Business Logic Layer**: Domain models and business rules
- **Data Access Layer**: Database operations and external integrations

### Dependency Inversion

One of the most powerful principles is ensuring that high-level modules don't depend on low-level modules. Both should depend on abstractions.

\`\`\`typescript
// Bad: Direct dependency
class UserService {
  constructor(private db: PostgresDatabase) {}
}

// Good: Depend on abstraction
interface IDatabase {
  query(sql: string): Promise<any>;
}

class UserService {
  constructor(private db: IDatabase) {}
}
\`\`\`

## Practical Implementation

In a modern web application, clean architecture might look like:

1. **API/Controllers** → Handle HTTP requests
2. **Use Cases** → Orchestrate business logic
3. **Domain Models** → Represent business entities
4. **Repositories** → Abstract data access

## Benefits

- **Testability**: Each layer can be tested in isolation
- **Maintainability**: Changes in one layer don't cascade
- **Flexibility**: Easy to swap implementations
- **Clarity**: Clear structure makes onboarding easier

## Conclusion

Clean architecture requires upfront investment, but pays dividends in the long run. Start small, focus on the most volatile parts of your system, and gradually apply these principles across your codebase.
    `,
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["Architecture", "Software Design", "Best Practices"]
  },
  {
    slug: "typescript-advanced-patterns",
    title: "Advanced TypeScript Patterns for Robust Applications",
    excerpt: "Dive deep into advanced TypeScript patterns including discriminated unions, conditional types, and mapped types. Learn how to leverage TypeScript's type system to catch bugs at compile time.",
    content: `
# Advanced TypeScript Patterns for Robust Applications

TypeScript's type system is incredibly powerful. Let's explore some advanced patterns that can make your code more robust and maintainable.

## Discriminated Unions

Discriminated unions (also called tagged unions) are a pattern for modeling data that can be one of several types:

\`\`\`typescript
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

function processResult<T, E>(result: Result<T, E>) {
  if (result.success) {
    // TypeScript knows result.data exists here
    console.log(result.data);
  } else {
    // TypeScript knows result.error exists here
    console.error(result.error);
  }
}
\`\`\`

## Conditional Types

Conditional types allow you to create types that depend on other types:

\`\`\`typescript
type ApiResponse<T> = T extends { id: number }
  ? T & { createdAt: Date }
  : T;

interface User {
  id: number;
  name: string;
}

// Type is: User & { createdAt: Date }
type UserResponse = ApiResponse<User>;
\`\`\`

## Mapped Types

Create new types by transforming properties of existing types:

\`\`\`typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};
\`\`\`

## Best Practices

1. **Prefer types over interfaces** for complex type operations
2. **Use const assertions** to get literal types
3. **Leverage utility types** like Partial, Required, Pick, Omit
4. **Create custom type guards** for runtime type checking

## Conclusion

These patterns help catch errors at compile time, improve IDE support, and make refactoring safer. Invest time in understanding TypeScript's type system—it's worth it.
    `,
    date: "2024-02-20",
    readTime: "10 min read",
    tags: ["TypeScript", "Programming", "Web Development"]
  },
  {
    slug: "mentorship-in-tech",
    title: "The Power of Mentorship in Software Engineering",
    excerpt: "Reflections on giving and receiving mentorship in the tech industry. How mentorship accelerates growth, builds community, and creates lasting impact beyond code.",
    content: `
# The Power of Mentorship in Software Engineering

Mentorship has been one of the most transformative experiences in my career—both as a mentee and as a mentor.

## What Mentorship Means

Mentorship isn't just about teaching technical skills. It's about:

- **Sharing experiences** and lessons learned
- **Providing perspective** on career decisions
- **Building confidence** in challenging situations
- **Creating connections** within the community

## As a Mentee

Early in my career, having mentors who believed in me made all the difference:

- They challenged me to take on projects I thought were beyond my abilities
- They provided honest feedback when I needed it most
- They opened doors to opportunities I didn't know existed

## As a Mentor

Giving back through mentorship has been equally rewarding:

- Watching mentees grow and achieve their goals
- Learning from their fresh perspectives and questions
- Contributing to a more inclusive tech community
- Building lasting professional relationships

## How to Be a Great Mentee

1. **Come prepared** with specific questions or topics
2. **Take action** on feedback and advice
3. **Be respectful** of your mentor's time
4. **Share your progress** and celebrate wins together

## How to Be a Great Mentor

1. **Listen more than you talk**
2. **Share failures** as well as successes
3. **Tailor your approach** to each mentee
4. **Make introductions** and open doors
5. **Be consistent** and reliable

## The Ripple Effect

When we invest in mentorship, we create a ripple effect that extends far beyond individual relationships. We build stronger teams, more inclusive communities, and a better tech industry for everyone.

## Getting Started

You don't need to be a senior engineer to mentor others. You just need to be one step ahead of someone else and willing to help.

Start small:
- Answer questions in online communities
- Pair program with junior developers
- Share your learning journey openly
- Volunteer with coding bootcamps or community programs

## Conclusion

Mentorship is one of the highest-leverage activities we can engage in as software engineers. It compounds over time and creates value that goes far beyond what we can build with code alone.
    `,
    date: "2024-03-10",
    readTime: "6 min read",
    tags: ["Career", "Mentorship", "Community"]
  }
];
