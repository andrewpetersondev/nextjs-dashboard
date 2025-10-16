Here’s how src/server/auth/ is organized and what each area is responsible for.

application/

- Purpose: Orchestrate use-cases. Coordinate validation, services, and side effects; expose Server Actions.
- Contents:
  - actions/: Thin entrypoints called by UI; parse inputs, call services, set/clear sessions, redirect.
  - services/: Application services implementing auth use-cases (e.g., signup/login). Depend only on ports.
    - adapters/: Wrap concrete infrastructure into ports (e.g., repository adapter, password hasher adapter).
    - factories/: Composition root to wire concrete implementations for runtime.
  - mapping/: Map service errors/results into app/UI-friendly shapes.

domain/

- Purpose: Business rules and types. Pure, framework-free; stable contracts and error model.
- Contents:
  - types/: Value objects, branded types, input DTOs used by services/repos.
  - errors/: Discriminated error types and helpers for business outcomes.
  - schemas/: Validation schemas for domain payloads (e.g., session payload model).
  - mappers/: Pure mappings from domain errors to higher-level representations when domain-aware.

infrastructure/

- Purpose: Technical details. DB, crypto, and other external systems. Replaceable adapters.
- Contents:
  - ports/: Interfaces required by application services (repositories, hashers).
  - crypto/: Concrete implementations (e.g., bcrypt) and thin utilities.
  - repository/:
    - dal/: Low-level DB calls and DB-specific error normalization.
    - repositories/: Repository implementations plus assertions/normalizers around DAL.

policy/

- Purpose: Cross-cutting authorization policies and guards.
- Contents:
  - Helpers to enforce role- or permission-based access; redirect/deny decisions; no business logic here.

session/

- Purpose: Session lifecycle mechanics, independent of a single use-case.
- Contents:
  - session.ts: High-level API to set/delete/verify/rotate session.
  - session-codec.ts: Create/verify tokens and validate payloads.
  - session-cookie.options.ts: Cookie attributes builder.
  - session-helpers.ts: Time/lifetime utilities.
  - session-jwt-payload.mapper.ts: Flatten/unflatten token payload.
  - session-payload.types.ts, session-update.types.ts: Session-related TypeScript types.
  - session.constants.ts: Session-related constants (cookie name, flags, etc.).
