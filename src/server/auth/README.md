# Auth Module Overview

Here’s how src/server/auth/ is organized and what each area is responsible for.

## application/

- Purpose: Orchestrate auth use-cases. Coordinate validation, services, and side effects; expose Server Actions.
- Contents:
  - actions/: Thin entry-points called by UI; parse inputs, call services/commands, set/clear sessions, redirect.
    - login.action.ts, signup.action.ts, logout.action.ts
    - establish-session.action.ts (wraps session cookie setup)
    - demo-user.action.ts (create demo user and log in)
    - verify-session-optimistic.action.ts (server-action wrapper)
  - commands/: Reusable command-style orchestrations returning Result (no redirects).
    - login.command.ts, signup.command.ts
  - services/: Application services implementing auth use-cases (e.g., signup/login). Depend only on ports.
    - auth-user.service.ts — business orchestration (never throws; returns Result)
    - adapters/: Wrap concrete infrastructure into ports (e.g., repository adapter, password hasher adapter).
    - factories/: Composition root to wire concrete implementations for runtime.
  - mapping/: Map service errors/results into app/UI-friendly shapes.
    - app-error.to-form-result.mapper.ts

## domain/

- Purpose: Business rules and types. Pure, framework-free; stable contracts and error model.
- Contents:
  - types/: Value objects, branded types, input DTOs used by services/repos.
    - auth-login.input.ts, auth-signup.input.ts
    - auth-signup.presence-guard.ts
    - password.types.ts
    - session-action.types.ts
    - user-transport.types.ts
  - errors/: Discriminated error types and helpers for business outcomes.
    - app-error.metadata.ts, app-error.factories.ts, app-error.mapping.repo.ts
  - schemas/: Validation schemas for domain payloads (e.g., session payload model).
    - session-payload.schema.ts
  - mappers/: Pure mappings from domain shapes.
    - user-transport.mapper.ts

## infrastructure/

- Purpose: Technical details. DB, crypto, and other external systems. Replaceable adapters.
- Contents:
  - ports/: Interfaces required by application services (repositories, hashers).
    - auth-user-repository.port.ts, password-hasher.port.ts
  - repository/:
    - dal/: Low-level DB calls and DB-specific error normalization.
      - execute-dal.ts, get-user-by-email.dal.ts, insert-user.dal.ts, pg-error.mapper.ts
    - repositories/: Repository implementations plus assertions/normalizers around DAL.
      - auth-user.repository.ts, auth-user.repository.errors.ts, auth-user.repository.assertions.ts

## policy/

- Purpose: Cross-cutting authorization policies and guards.
- Contents:
  - authorize.ts — ensure roles or redirect to login.

## session/

- Purpose: Session lifecycle mechanics, independent of a single use-case.
- Contents:
  - session.ts: High-level API to set/delete/verify/rotate session.
  - session-codec.ts: Create/verify tokens and validate payloads.
  - session-cookie.options.ts: Cookie attributes builder.
  - session-helpers.ts: Time/lifetime utilities.
  - session-jwt-payload.mapper.ts: Flatten/unflatten token payload.
  - session-payload.types.ts, session-update.types.ts: Session-related TypeScript types.
  - session.constants.ts: Session-related constants (cookie name, flags, etc.).

## Dependency Inversion Reminder (Ports and Adapters)

- The service depends on small, stable ports, not concrete tech.
  - In AuthUserService:
    - private readonly repo: AuthUserRepository
    - private readonly hasher: PasswordHasher
  - These are interfaces describing what the service needs (user persistence and password hashing).

- Concrete implementations are injected at composition time (see factories):
  - AuthUserRepositoryAdapter wraps the DB-backed repository implementation.
  - BcryptPasswordHasher wraps the hashing library.
  - Tests can inject fakes/mocks.

- Benefits:
  1. Testable: swap implementations without touching service logic.
  2. Replaceable: change DB or hashing details behind adapters.
  3. Decoupled: service stays framework/infra-agnostic; only contracts matter.

## Typical Flows

- Actions (login/signup):
  1. Validate form data → 2) create service via factory → 3) call service/command → 4) establish session → 5) redirect.
- Commands (login/signup):
  - Return FormResult with either data or validation-style errors; no redirects or cookie side effects.
