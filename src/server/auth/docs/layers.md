# Auth/User Layered Architecture (Next.js App Router, TypeScript Strict)

Flow: DAL ↔ Repository ↔ Service ↔ Action ↔ UI (RSC/Client)

---

## Models & Types (canonical boundaries)

- DB Row: persistence shape only.
- Domain Entity (UserEntity): business-safe, branded ids, invariants enforced.
- DTO (UserDto): UI-safe projection (no secrets/PII).
- Input Schemas: Zod at Action boundary; derive types via z.output.
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
    - actions/ login.ts, register.ts, logoutAction.ts
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
    - logoutAction(cmd: { sessionToken: string }): Promise<Result<void, DenseErrorMap>>
    - getProfile(cmd: { userId: UserId }): Promise<Result<UserDto, DenseErrorMap>>

---

## Testing Guidance

- Unit: mappers, validators, Service with fake repo/crypto/token/clock.
- Integration: Repo + DAL against test DB.
- E2E: Actions + UI (Cypress) for login/logoutAction/register.

---

## Do/Don’t Summary

- Do: strict types, branded ids, DTOs, Zod at boundary, DI, discriminated Results.
- Don’t: pass entities from Action to Service; throw in Service/Action/UI; leak DB rows; log secrets; validate in
  DAL/Repo.

---

## Transaction Boundary (multi-entity invariants)

- Where invariants live: define business invariants in the Service. The Service is responsible for orchestration across
  aggregates.
- Execution model: the Service initiates a transaction via repository facilities, keeping orchestration in the Service
  while delegating DB operations to the Repository.
- Preferred API:
    - Repository exposes withTransaction<T>(fn: (txRepo) => Promise<T>): Promise<T>.
    - txRepo provides the same Repository interface bound to the transactional connection.
- Pattern:
    1) Service validates command and loads required entities (read-only) if needed.
    2) Service calls repo.withTransaction(async (tx) => { ... }) when it must update multiple entities or enforce
       cross-entity invariants atomically.
    3) All writes and any reads that must be consistent occur via tx within the callback.
    4) The Service returns a Result; infra exceptions inside the transaction are caught and mapped to an unexpected
       result.
- Rationale: preserves domain orchestration at Service, prevents leaking transaction concerns into Actions/UI, and
  centralizes DB atomicity in the Repository.

---

## UI Contracts (DTOs/redirects only + progressive enhancement)

- Action return contract:
    - Actions must return only:
        - a DTO (or form state shape) for success/failure rendering; or
        - perform a redirect on success paths.
    - Actions must never return the Service Result union directly to the client. They must map:
        - Expected service errors → DenseErrorMap suitable for the UI.
        - Unexpected service errors → generic form-level error, with server-side logging.
- Progressive enhancement (optimistic UI):
    - Client initiates optimistic update locally (e.g., temporary UI state).
    - Submit to an Action that re-validates on the server using the same Zod command schema.
    - On success: Action returns authoritative DTO; UI reconciles (conflict-free).
    - On expected failure: UI replaces optimistic state with server-provided DenseErrorMap and reverts optimistic
      changes as needed.
    - On unexpected failure: UI shows a generic error and reverts optimistic changes; detailed diagnostics remain
      server-side.
- RSC alignment:
    - Prefer Server Components for reads; pass DTOs as props.
    - Client Components should use Actions for mutations and rely on server validation; avoid exposing entities or raw
      errors to the client.
