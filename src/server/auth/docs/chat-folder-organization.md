# AI Chat—Organize Server Auth Folder

Here’s a minimal, incremental, and reversible refactor plan for src/server/auth aligned with current-focus.md.

Suggested folder structure (tree)

- src/server/auth/
  - [x] application/ // use-case orchestration, actions, service factories
    - actions/
      - login.action.ts
      - signup.action.ts
      - logout.action.ts
      - establish-session.action.ts
      - demo-user.action.ts
      - verify-session-optimistic.action.ts
    - services/
      - user-auth.service.ts
      - user-auth.service.factory.ts
  - domain/ // pure domain types, errors, schemas, mappers
    - errors/
      - auth-errors.ts
    - mappers/
      - auth-service-errors.mapper.ts
    - schemas/
      - session-payload.schema.ts
    - types/
      - login.dtos.ts
      - password.types.ts
      - session-action.types.ts
      - signup.dtos.ts
  - infrastructure/ // adapters: repo impls, crypto, dal, pg error mapping
    - crypto/
      - bcrypt-password-hasher.adapter.ts
    - repository/
      - user-auth.repository.ts
      - dal/
        - dal-execution.ts
        - get-user-by-email.dal.ts
        - insert-user.dal.ts
        - pg-error-handler.ts
        - db-dal-error-boundary-checklist.md
    - ports/ // hex ports (closer to domain but kept here to avoid circulars)
      - password-hasher.port.ts
      - user-auth.repository.port.ts
  - session/ // session boundaries: cookie, jwt, constants, mappers, types
    - constants.ts
    - session-codec.ts
    - session-jwt.mapper.ts
    - session-payload.types.ts
    - session.ts
  - policy/ // authz helpers
    - authorize.ts

Rename suggestions

- [x] service/user-auth.service.factory.ts → application/services/user-auth.service.factory.ts
  - Rationale: Factory belongs to application composition layer.
- [x] service/user-auth.service.ts → application/services/user-auth.service.ts
  - Rationale: Application service orchestrates use cases.
- [x] actions/_.ts → application/actions/_.ts (keep filenames)
  - Rationale: Server actions are application-layer entrypoints.
- crypto/password-hasher.bcrypt.ts → infrastructure/crypto/bcrypt-password-hasher.adapter.ts
  - Rationale: Clarify it’s a concrete adapter for PasswordHasher.
- repo/user-auth.repository.ts → infrastructure/repository/user-auth.repository.ts
  - Rationale: It is an infra repository implementation.
- repo/dal/dal-execution.ts → infrastructure/repository/dal/dal-execution.ts
  - Rationale: Keep DAL helpers colocated under repository.
- repo/dal/get-user-by-email.dal.ts → infrastructure/repository/dal/get-user-by-email.dal.ts
  - Rationale: Maintain DAL naming and location.
- repo/dal/insert-user.dal.ts → infrastructure/repository/dal/insert-user.dal.ts
  - Rationale: Maintain DAL naming and location.
- repo/dal/pg-error-handler.ts → infrastructure/repository/dal/pg-error-handler.ts
  - Rationale: PG mapping is DAL-focused infra.
- domain/mappers/auth-service-errors.mappers.ts → domain/mappers/auth-service-errors.mapper.ts
  - Rationale: Singular “mapper” for file naming consistency.
- authz/authorize.ts → policy/authorize.ts
  - Rationale: Expresses policy concerns clearly.
- domain/errors/auth-error-to-form-result.mapper.ts → domain/mappers/auth-error-to-form-result.mapper.ts
  - Rationale: Keep all mappers together under domain/mappers.

Extraction suggestions

- application/services/user-auth.service.ts
  - Extract normalizeSignupInput and hasRequiredSignupFields → domain/types/auth-signup.helpers.ts
  - Rationale: Pure helpers; improves cohesion in service and enables reuse.
- application/services/user-auth.service.factory.ts
  - Extract in-file classes CryptoPasswordHasher and RepoAdapter into:
    - infrastructure/crypto/bcrypt-password-hasher.adapter.ts (CryptoPasswordHasher)
    - infrastructure/repository/user-auth.repo-adapter.ts (RepoAdapter)
  - Rationale: Keeps factory slim and adapters reusable/testable.
- session/session.ts
  - Extract internal helpers absoluteLifetime, timeLeftMs → session/session-helpers.ts
  - Rationale: Pure computations; better testability and separation from side-effects.

Risks or trade-offs

- Moving files will require updating import paths; keep changes scoped within src/server/auth.
- Splitting adapters out of the factory adds small file count but improves clarity.
- Keeping ports under infrastructure/ports avoids circular deps with domain; acceptable trade-off to remain minimal and reversible.

Short checklist to implement changes safely

- Move folders/files per the structure above; update all relative imports within src/server/auth.
- Perform renames exactly as listed; search-and-replace import paths.
- Add the two small extractions:
  - domain/types/auth-signup.helpers.ts for normalizeSignupInput, hasRequiredSignupFields.
  - session/session-helpers.ts for absoluteLifetime, timeLeftMs.
- Keep behavior identical; do not change function signatures or logic.
- Run type-checks (pnpm typecheck) and tests (pnpm test) to validate.
- Grep for old paths/names to ensure no stale imports remain.
- Avoid introducing index.ts barrels or re-exports.

## next chat

Great progress. Next minimal, reversible steps to finish aligning src/server/auth with the focus rules.

Suggested folder structure (tree)

- src/server/auth/
  - application/
    - actions/ (unchanged)
    - services/
      - user-auth.service.ts
      - user-auth.service.factory.ts
      - adapters/
        - repo.adapter.ts
        - bcrypt-password-hasher.adapter.ts
  - domain/
    - errors/
      - auth-errors.ts
    - mappers/
      - auth-service-errors.mapper.ts
      - auth-error-to-form-result.mapper.ts
    - schemas/
      - session-payload.schema.ts
    - types/
      - auth-signup.helpers.ts
      - login.dtos.ts
      - password.types.ts
      - session-action.types.ts
      - signup.dtos.ts
  - infrastructure/
    - repository/
      - user-auth.repository.ts
      - dal/
        - dal-execution.ts
        - db-dal-error-boundary-checklist.md
        - get-user-by-email.dal.ts
        - insert-user.dal.ts
        - pg-error-handler.ts
    - ports/
      - password-hasher.port.ts
      - user-auth.repository.port.ts
  - policy/
    - authorize.ts
  - session/
    - constants.ts
    - session-codec.ts
    - session-jwt.mapper.ts
    - session-payload.types.ts
    - session.ts

Rename suggestions

- [x] domain/mappers/auth-service-errors.mappers.ts → domain/mappers/auth-service-errors.mapper.ts
  - Rationale: singular “mapper” consistency.
- [x] infrastructure/crypto/password-hasher.bcrypt.ts → application/services/adapters/bcrypt-password-hasher.adapter.ts
  - Rationale: it’s an application-layer adapter implementing a port.
- [x] application/services/user-auth.service.factory.ts: extract in-file classes into:
  - application/services/adapters/repo.adapter.ts
  - application/services/adapters/bcrypt-password-hasher.adapter.ts
  - Rationale: slim factory; reusable adapters.
- [x] infrastructure/repository/user-auth.repository.ts: keep name but ensure all imports point to infrastructure/... (already mostly done).
  - Rationale: clarity on infra implementation file.

Extraction suggestions

- [x] application/services/user-auth.service.ts
  - normalizeSignupInput, hasRequiredSignupFields → domain/types/auth-signup.helpers.ts
  - Rationale: pure helpers; improve cohesion and reuse.
- [x] application/services/user-auth.service.factory.ts
  - Move RepoAdapter → application/services/adapters/repo.adapter.ts
  - Move CryptoPasswordHasher → application/services/adapters/bcrypt-password-hasher.adapter.ts
  - Rationale: adapters separated from wiring.
- [x] session/session.ts
  - absoluteLifetime, timeLeftMs → session/session-helpers.ts (optional; only if used in tests or reused)
  - Rationale: pure computations easier to test; no behavior change.

Risks or trade-offs

- Import churn; contained within src/server/auth. No behavioral changes.

Short checklist to implement safely

- Move/rename files as above; update imports within src/server/auth only.
- Do not introduce index/barrel files.
- Run: pnpm typecheck && pnpm test.
- Search for old paths: “auth-service-errors.mappers”, “password-hasher.bcrypt”, “CryptoPasswordHasher”, “RepoAdapter”.

If you want, I can generate the exact path-by-path move plan with from → to mappings so you can apply it quickly.
