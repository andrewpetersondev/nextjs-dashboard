# Hexagonal Architecture (Ports & Adapters)

Rules for maintaining clean boundaries within module `server/` directories.

## Architectural Intent

1. **Inward Dependency Flow**: Outer layers (Infrastructure, Actions) depend on inner layers (Application, Domain).
2. **Framework Agnostic Core**: Business logic must not know about Next.js, React, or specific DB drivers.
3. **Ports define Capabilities**: Interfaces (Ports) belong to the Application layer, not Infrastructure.

## Canonical Layer Mapping

| Folder                         | Layer          | Responsibility                                                          |
| :----------------------------- | :------------- | :---------------------------------------------------------------------- |
| `server/actions`               | Adapter        | Entry points. Parse input, call one workflow/use-case, return response. |
| `server/application/workflows` | Application    | Orchestrates multiple use cases/services.                               |
| `server/application/use-cases` | Application    | A single business capability. Owns transaction boundaries.              |
| `server/application/services`  | Domain         | Pure, stateless business rules.                                         |
| `server/application/ports`     | Ports          | Interfaces for DB, APIs, or system capabilities.                        |
| `server/infrastructure`        | Infrastructure | Adapter implementations (Drizzle, JWT, etc).                            |

## Dependency Rules

- **No Frameworks in Core**: `application/` and `services/` must not import `next/*`, `react/*`, `drizzle`, or `prisma`.
- **Port Ownership**: Infrastructure implements Ports. Application depends **only** on Ports.
- **Transactions**: Use a `UnitOfWorkPort` for transactions. Repositories must not expose transaction logic directly.
- **Thin Actions**: Actions must contain zero business logic. They are "glue" between HTTP and the Application layer.

## Transaction Constraints

- `AuthTxDeps` (or similar) must be **DB-only**.
- No cookies, hashing, or network calls inside transaction-scoped dependencies.
