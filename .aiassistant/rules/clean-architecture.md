---
apply: off
patterns: src/modules/**/*.ts
---

# Clean Architecture Standards

Rules for maintaining strict architectural boundaries and ensuring business logic remains independent of frameworks and drivers.

## Core Principles

1. **The Dependency Rule**: Source code dependencies must point only inwards. Nothing in an inner circle can know anything at all about something in an outer circle.
2. **Framework Independence**: The architecture does not depend on the existence of some library of feature-laden software.
3. **Testability**: The business rules can be tested without the UI, Database, Web Server, or any other external element.

## Layer Mapping

| Folder                         | Clean Layer        | Responsibility                                                      |
| :----------------------------- | :----------------- | :------------------------------------------------------------------ |
| `server/actions`               | Interface Adapters | Web/Next.js entry points. Parse inputs, call Use Cases.             |
| `server/application/use-cases` | Use Cases          | Application-specific business rules. Orchestrates flow of data.     |
| `server/application/services`  | Entities           | Enterprise-wide business rules/Domain logic. Pure functions/models. |
| `server/application/contracts` | Ports              | Interfaces for external dependencies (Repositories, Services).      |
| `server/infrastructure`        | Infrastructure     | Frameworks and Drivers (Drizzle, Session, External APIs).           |

## Dependency Constraints

- **Inner Core Isolation**: `application/` must never import from `infrastructure/`, `next/*`, or `react`.
- **Use Case Driven**: One file per Use Case. Use cases should be the "screaming architecture" of what the module does.
- **Contract First**: Infrastructure must implement interfaces defined in `application/contracts`. Use cases only ever interact with these contracts.
- **Thin Actions**: Server Actions are purely for request/response handling. No business logic, no DB queries.

## Data Flow

1. `Action` receives request.
2. `Action` invokes `Use Case`.
3. `Use Case` interacts with `Entities` and `Contracts` (implemented by `Infrastructure`).
4. `Use Case` returns a DTO (Data Transfer Object) back to the `Action`.

## Transaction & Persistence Rules

- **Unit of Work**: Use a `UnitOfWork` or `Transaction` contract to manage atomicity. Use Cases should own the transaction boundary, but not the implementation details.
- **Pure Dependency Injection**: Transaction-scoped dependencies (e.g., `AuthTxDeps`) must remain DB-only.
- **Constraint**: Never perform side effects like network calls, cookie manipulation, or password hashing inside a database transaction block.
- **Repository Isolation**: Repositories must not expose transaction logic; they should accept a transaction context provided by the Use Case via the contract.
