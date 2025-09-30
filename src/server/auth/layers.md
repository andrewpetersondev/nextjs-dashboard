# Auth/User Layered Architecture (Next.js App Router, TypeScript Strict)

Flow: DAL ↔ Repository ↔ Service ↔ Action ↔ UI (RSC/Client)

---

## Models & Types (canonical boundaries)

- DB Row: persistence shape only.
- Domain Entity (UserEntity): business-safe, branded ids, invariants enforced.
- DTO (UserDto): UI-safe projection (no secrets/PII).
- Input Schemas: Zod at Action boundary; derive types via z.infer.
- Result union:
    - { ok: true, data: T }
    - { ok: false, kind: "expected", errors: DenseErrorMap }
    - { ok: false, kind: "unexpected", message: string } // generic, no internals
- DenseErrorMap: { form?: string; fields?: Record<string, string> }

---

## DAL (Database Access Layer)

- Responsibility: parameterized Drizzle queries. No domain rules.
- Input: (db, params)
- Output: DB Row or null (never entities/DTOs)
- Errors:
    - Expected (no rows): return null
    - Unexpected (SQL/connection): throw infra error
- Notes: small, pure functions; narrow selectors (byId, byEmail, insert, update).

---

## Repository

- Responsibility: DB Row ⇄ Domain Entity mapping; aggregate fetches; transactions.
- Input: params (uses DAL internally)
- Output: UserEntity | null (or throws infra error)
- Errors:
    - Catch DAL exceptions → rethrow as infra error (no domain meaning)
- Notes:
    - Centralize mappers; never leak DB Row.
    - Provide transaction-aware APIs (accept tx db) when needed.

---

## Service (Business Logic, command-style API)

- Responsibility: auth rules, invariants, orchestration (hashing, tokens, ACL).
- Input: a single validated command object from Action
    - Service fetches any required entities from Repository internally.
    - Actions NEVER pass entities to Service.
- Output: Result<T, DenseErrorMap>
- Errors:
    - Expected: { ok: false, kind: "expected", errors }
    - Unexpected: catch infra errors → { ok: false, kind: "unexpected", message }
- Notes:
    - Never throw; return typed results.
    - Keep pure logic separate from side-effects; inject abstractions (clock, crypto, tokens, mailer).
    - No framework-specific code (no Request/Response).

---

## Action (Server Action / Route Handler)

- Responsibility: boundary validation (Zod), session/auth enforcement, bridge Service ↔ UI.
- Input: (prevState, formData) or request payload
- Output: DenseErrorMap for UI, or redirect/DTO
- Errors:
    - Map Zod issues to dense map
    - Pass service expected errors as-is
    - Map service unexpected to generic form error (log internally)
- Notes:
    - "use server". Validate early; avoid over-posting.
    - Return DTOs only; never entities or raw errors.

---

## UI (RSC/Client)

- Responsibility: render states, submit to Actions, show dense errors.
- Input: DTOs and DenseErrorMap
- Output: JSX
- Notes:
    - Prefer Server Components for reads.
    - Client Components only for interactivity; avoid client fetching when server can pre-render.
    - Show dense map on failure; sparse updates for partial forms.

---

## Security & Privacy

- Hashing/Secrets: only in Service; inject crypto/token providers.
- PII: never log; DTOs omit sensitive fields.
- Sessions: set/delete in Actions; enforce authorization in Service where needed.
- Do not expose internal error details to clients.

---

## Dependency Injection (constructor/factory)

- Inject: db (Drizzle), logger, clock, crypto, token service, mailer.
- Benefit: testability, mockability, clear seams.

---

## Error & Logging Strategy

- Contextual, structured logs in Service/Action; sanitize and avoid secrets.
- DAL/Repo may throw; Service catches → unexpected Result.
- Action maps unexpected → generic UI message; logs full server-side.

---

## File/Module Layout (feature-first)

- src/features/auth/
    - dal/ users.dal.ts
    - repo/ users.repo.ts
    - service/ auth.service.ts
    - actions/ login.ts, register.ts, logout.ts
    - ui/ components (client/server), forms
    - mapping/ user.mappers.ts (dbRow⇄entity, entity⇄dto)
    - schemas/ user.schemas.ts (Zod)
    - types/ user.types.ts (Entity, DTO, Result, DenseErrorMap)

---

## Example Contracts (concise)

- Repository:
    - getById(id: UserId): Promise<UserEntity | null>
    - getByEmail(email: Email): Promise<UserEntity | null>
    - create(user: NewUserEntity): Promise<UserEntity>
    - updateProfile(id: UserId, patch: UserProfilePatch): Promise<UserEntity>
- Service (command-style):
    - register(cmd: { email; password; username; role? }): Promise<Result<UserDto, DenseErrorMap>>
    - login(cmd: { email; password }): Promise<Result<{ user: UserDto; sessionToken: string }, DenseErrorMap>>
    - logout(cmd: { sessionToken: string }): Promise<Result<void, DenseErrorMap>>
    - getProfile(cmd: { userId: UserId }): Promise<Result<UserDto, DenseErrorMap>>

---

## Testing Guidance

- Unit: mappers, validators, Service with fake repo/crypto/token/clock.
- Integration: Repo + DAL against test DB.
- E2E: Actions + UI (Cypress) for login/logout/register.

---

## Do/Don’t Summary

- Do: strict types, branded ids, DTOs, Zod at boundary, DI, discriminated Results.
- Don’t: pass entities from Action to Service; throw in Service/Action/UI; leak DB rows; log secrets; validate in
  DAL/Repo.
