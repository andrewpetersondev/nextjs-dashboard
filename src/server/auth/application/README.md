# Auth Application Layer

Purpose: orchestrates auth use-cases (login, signup, session) by composing domain logic with infrastructure via small, testable ports. No UI or transport concerns here.

Structure

1. actions/ — Server Actions (Next.js “use server”) that handle request-bound workflows:

- login.action.ts
- signup.action.ts
- logout.action.ts
- establish-session.action.ts
- demo-user.action.ts
- verify-session-optimistic.action.ts

2. mapping/ — Translators between service-layer errors and app-facing error shapes:

- auth-service-error.to-app-error.ts

3. services/ — Core service and composition:

- auth-user.service.ts — business orchestration (never throws; returns Result)
- adapters/ — concrete implementations of service ports (e.g., password hasher, repo adapter)
- factories/ — composition roots creating fully wired services

Key Principles

1. Server-only: runs on the server; side effects belong here (e.g., session cookies).
2. Port-adapter style: services depend on small ports (e.g., AuthUserRepository, PasswordHasher) for testability.
3. Result-first API: service methods return Result<Success, Error>; callers don’t handle exceptions.
4. Transactions at the boundary: repository adapter exposes withTransaction for atomic operations.
5. Narrow responsibilities: actions validate inputs and call services; services coordinate domain logic; adapters bridge to infra.

Typical Flow

- Server Action validates form data → creates service via factory → calls service.login/signup → establishes session → redirects.

Testing Guidance

- Unit-test services by injecting mock ports.
- Integration-test actions with a test DB and controlled session helpers.
- Verify error mapping separately in mapping/.

When to add here

- New auth use-case orchestration (service method).
- New server action that invokes existing services.
- New adapter to satisfy a port (e.g., alternative password hasher).
- New factory to compose different infra (e.g., in-memory for tests).

Out of scope

- UI components, client hooks.
- Direct DB queries (place in infrastructure repositories).
- Cross-feature domain types (keep in shared/domain or feature modules).
