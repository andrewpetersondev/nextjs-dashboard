# Auth Application Layer

Purpose: orchestrate auth use-cases (login, signup, session) by composing domain and infrastructure via small, testable ports. No UI or transport concerns here.

## Structure

1. **actions/** — Server Actions ("use server") for request-bound workflows:
   - `login.action.ts` — handles user login flow
   - `signup.action.ts` — handles user registration
   - `logout.action.ts` — handles user logout
   - `establish-session.action.ts` — creates authenticated session
   - `demo-user.action.ts` — demo user login flow
   - `verify-session-optimistic.action.ts` — optimistic session verification
   - `auth-pipeline.helper.ts` — shared pipeline utilities for actions

2. **services/** — Core services and composition:
   - `auth-user.service.ts` — business orchestration (never throws; returns Result)
   - **adapters/** — concrete implementations of service ports
     - `auth-user-repository.adapter.ts` — repository implementation
     - `password-hasher-bcrypt.adapter.ts` — bcrypt password hashing
   - **factories/** — composition roots creating fully wired services
     - `auth-user-service.factory.ts` — creates configured auth service instances

## Key Principles

1. **Server-only**: runs on the server; side effects belong here (e.g., session cookies).
2. **Port-adapter**: services depend on small ports (AuthUserRepositoryPort, PasswordHasherPort) for testability.
3. **Result-first API**: service methods return `Result<Success, Error>`; callers don't handle exceptions.
4. **Transactions at the boundary**: repository adapter can expose `withTransaction` for atomic operations.
5. **Narrow responsibilities**: actions validate inputs and call services; services coordinate domain logic; adapters bridge to infra.

## Typical Flow

Server Action validates form data → creates service via factory → calls service method (e.g., login/signup) → establishes session → redirects.

## Testing Guidance

- Unit-test services by injecting mock ports.
- Unit-test actions with mock services.
- Integration-test actions with a test DB and controlled session helpers.

## When to add here

- New auth use-case orchestration (service method).
- New server action that invokes existing services.
- New adapter to satisfy a port (e.g., alternative password hasher).
- New factory to compose different infra (e.g., in-memory for tests).
- Shared pipeline helpers in actions/ directory.

## Out of scope

- UI components, client hooks.
- Direct DB queries (place in infrastructure repositories).
- Cross-feature domain types (keep in shared/domain or feature modules).
