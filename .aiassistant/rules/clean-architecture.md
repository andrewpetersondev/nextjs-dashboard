---
apply: by file patterns
patterns: src/modules/**/*.ts
---

# Clean Architecture Standards

## Core Principles

1. **Strict Dependency Rule**: Source code dependencies must point only inwards.
   - `Domain` knows NOTHING about `Application`, `Infrastructure`, or `Presentation`.
   - `Application` knows NOTHING about `Infrastructure` or `Presentation`.
2. **Persistence Ignorance**: The Domain layer should not be aware of how data is stored.
3. **Library Independence**: Core business logic (Entities/Domain Services) should avoid dependencies on third-party libraries (including Zod) where possible to prevent "vendor lock-in" of the business core.
4. **Framework Isolation**: `domain/` and `application/` must never import from `next/*`, `react`, or any DB-specific libraries (e.g., `drizzle-orm`).

## Layer Responsibilities & Mapping

| Layer            | Responsibility             | Contents                                                                       |
| :--------------- | :------------------------- | :----------------------------------------------------------------------------- |
| `domain`         | Enterprise Business Rules  | Entities, Value Objects, Domain Services (Interfaces), Domain Exceptions.      |
| `application`    | Application Business Rules | Use Cases (Interactors), DTOs, Application Service Contracts (Ports), Mappers. |
| `infrastructure` | Technical Details          | DB Repositories (Adapters), External API clients, Framework-specific logic.    |
| `presentation`   | Delivery Mechanism         | UI Components, Server Actions (Adapters), Controllers.                         |

## Dependency Constraints

- **Inner Core Isolation**: High-level modules (Application) must not depend on low-level modules (Infrastructure). Both must depend on abstractions (Contracts).
- **Boundary Crossing**: Data crossing from Infrastructure to Application must be mapped. Never leak Database Records or raw API responses into the Use Cases.
- **Testability**: Business rules must be testable in isolation. Use Cases should be verifiable using mocks for contracts without requiring a browser or database.

- **The Domain Boundary**: `domain/` must NEVER import from `application/`. This includes DTOs. If a repository needs to live in the domain, it must only accept and return Domain Entities or Primitives.
- **Repository Placement**:
  - **Domain Repositories**: Interfaces that deal with Entities live in `domain`.
  - **Application Repositories**: Interfaces that deal with DTOs or specific Use Case needs live in `application`.
- **Mappers**: Logic that converts Entities to DTOs belongs in the `application` layer (Mappers), not the Domain.
- **Side-Effect Isolation**: Implementations of "mechanisms" (e.g., Random Password Generation, Hashing, GUID generation) belong in `infrastructure`. The domain only defines the "Need" via an interface.
