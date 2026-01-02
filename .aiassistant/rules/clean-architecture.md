---
apply: by file patterns
patterns: src/modules/**/*.ts
---

# Clean Architecture Standards

Rules for maintaining strict architectural boundaries and ensuring business logic remains independent of frameworks and drivers.

## Core Principles

1. **The Dependency Rule**: Source code dependencies must point only inwards. Nothing in an inner circle can know anything at all about something in an outer circle.
2. **Framework Independence**: The architecture does not depend on the existence of some library of feature-laden software. Business logic is separated from Next.js, React, and DB drivers.
3. **Testability**: Business rules are tested in isolation using mocks for contracts. Use Cases should be testable with pure vitest/jest without a browser or DB.

## Layer Mapping

| Folder                   | Clean Layer        | Responsibility                                                                 |
| :----------------------- | :----------------- | :----------------------------------------------------------------------------- |
| `domain`                 | Domain             | Enterprise Business Rules: Entities, Value Objects, Domain Events.             |
| `application/use-cases`  | Use Cases          | Application Business Rules: Orchestration of domain objects to achieve a task. |
| `application/contracts`  | Interfaces         | Port definitions (e.g., `IRepository`, `IMailer`) used by Use Cases.           |
| `application/dtos`       | Data Transfer      | Plain objects for input/output boundaries of the application layer.            |
| `infrastructure`         | Infrastructure     | Framework/Tool implementations (Drizzle, Stripe, Redis).                       |
| `infrastructure/actions` | Interface Adapters | Server Actions: Bridge between Web/HTTP and Application layer.                 |
| `presentation`           | Presentation       | React Components (UI) and client-side logic.                                   |

## Dependency Constraints

- **Inner Core Isolation**: `domain/` and `application/` must never import from `infrastructure/`, `next/*`, `react`, or any DB-specific libraries.
- **Dependency Inversion**: High-level modules (Application) must not depend on low-level modules (Infrastructure). Both must depend on abstractions (Contracts).
- **Use Case Driven**: One file per Use Case. Use cases should be the "screaming architecture" of what the module does.
- **Contract First**: Infrastructure must implement interfaces defined in `application/contracts`. Use cases only ever interact with these contracts.
- **Boundary Crossing**: Data crossing the boundary from Infrastructure to Application should be mapped to Domain Entities or DTOs. Never leak DB rows or raw API responses into Use Cases.

## Transaction & Persistence Rules

- **Unit of Work**: Use a `UnitOfWork` or `Transaction` contract to manage atomicity. Use Cases should own the transaction boundary, but not the implementation details.
- **Pure Dependency Injection**: Transaction-scoped dependencies (e.g., `AuthTxDeps`) must remain DB-only.
- **Constraint**: Never perform side effects like network calls, cookie manipulation, or password hashing inside a database transaction block.
- **Repository Isolation**: Repositories must not expose transaction logic; they should accept a transaction context provided by the Use Case via the contract.
