# Part 1

## Candidates in `src/modules/auth/application/use-cases` that should be extracted

Below are the main “repeat/complexity hotspots” in this folder that are good extraction targets (to helpers/policies/services), with **what** to extract and **why**.

---

## 1) Repeated “read cookie → decode token → handle failures” logic (extract a helper)

### Where it shows up

- `get-session.use-case.ts`:
  - `get()` cookie
  - `decode(token)`
  - on decode failure: `cleanupInvalidToken(...)` and then either `Err(unexpected)` or `Ok(undefined)`
  - extra validation: `if (!decoded.userId) { cleanup; Ok(undefined) }`
- `rotate-session.use-case.ts`:
  - `get()` cookie
  - `decode(current)`
  - on decode failure: log + `cleanupInvalidToken(...)` + return `Ok({ refreshed:false, ... })`
- `verify-session.use-case.ts`:
  - `get()` cookie
  - `decode(token)`
  - on decode failure: log + `Err(decodedResult.error)`
  - claim validation: `if (!decoded.userId) Err(makeInvalidSessionClaimsError(...))`

### What to extract

A small helper (application-layer helper) that centralizes:

- fetching token from `SessionStoreContract`
- decoding via `SessionTokenServiceContract`
- optionally cleaning up invalid tokens
- returning a normalized “decoded session or reason” shape

Example extraction target (conceptually):

- `session-token-reader.helper.ts` (or similar) that returns something like:
  - `Ok({ kind: "missing" })`
  - `Ok({ kind: "invalid" })` (+ optionally didCleanup)
  - `Ok({ kind: "decoded", decoded })`
  - `Err(AppError)` only for true operational/unexpected failures

### Why it’s worth it

- Right now, each use case re-implements slightly different branches and semantics.
- Extraction makes it explicit which flows **clean up** vs **don’t**, and helps prevent subtle divergence.

---

## 2) Session cookie set/delete + logging wrappers (extract a small “session store operations” helper)

### Where it shows up

- `establish-session.use-case.ts`:
  - issue token → `sessionCookieAdapter.set(token, expiresAtMs)` → log
- `rotate-session.use-case.ts`:
  - re-issue token → `set(token, expiresAtMs)` → log
  - termination path: `sessionCookieAdapter.delete()` → log
- `terminate-session.use-case.ts`:
  - `delete()` → log + error logging

### What to extract

A helper that wraps the store call and logging consistently, e.g.:

- `setSessionCookieAndLog(...)`
- `deleteSessionCookieAndLog(...)`

### Why it’s worth it

- Logging payload keys and operation names are repetitive and easy to make inconsistent over time.
- You already have a clear “operationContext: session” convention—extracting ensures uniformity.

---

## 3) `RotateSessionUseCase` private methods are doing “workflow-ish” branching (extract handlers or a workflow)

### Where it shows up

- `rotate-session.use-case.ts` has:
  - branching logic
  - multiple logs
  - two private handlers:
    - `handleTermination(...)`
    - `handleRotation(...)`

### What to extract

If you want to keep “use case = single capability”, then:

- Extract the termination/rotation handlers into **separate use-cases** (or into an application service), and let `RotateSessionUseCase` orchestrate.
  - e.g. `terminate-current-session.use-case.ts` and `rotate-current-session.use-case.ts`
- Or reframe `rotate-session.use-case.ts` into a `.workflow.ts` (since it’s orchestrating multiple steps/branches), leaving smaller use-cases underneath.

### Why it’s worth it

- This file is already an orchestration unit (policy evaluation + branching + store mutation + logging).
- Splitting reduces cognitive load and makes each behavior easier to test.

---

## 4) Anti-enumeration error mapping at the use-case boundary (extract “credential failure” factory)

### Where it shows up

- `login.use-case.ts` creates errors via `makeAppError(...)` and then wraps with `applyAntiEnumerationPolicy(...)` twice:
  - user missing → `not_found` → apply policy
  - invalid password → `invalid_credentials` → apply policy

### What to extract

A small function that produces the _public-safe_ credential error in one place, e.g.:

- `makeCredentialFailureError(...)` (internally uses `applyAntiEnumerationPolicy(...)`)

### Why it’s worth it

- Prevents accidental bypass of the anti-enumeration policy if future branches add new credential failures.
- Makes `LoginUseCase` read like intent instead of mechanics.

---

## 5) Workflows share a repeated “execute → map to session principal → establish session” pattern (extract a shared workflow helper)

### Where it shows up

- `login.workflow.ts`
- `signup.workflow.ts`
- `create-demo-user.workflow.ts`

All do the same essential shape:

1. Run a use case that returns an auth user output dto
2. `toSessionPrincipal(...)`
3. `sessionService.establish(user)`
4. bubble errors

### What to extract

A reusable workflow helper like:

- `establish-session-for-user.workflow.ts` (a small function that accepts “get user” result or a callback)

### Why it’s worth it

- Removes repetition and keeps workflows ultra-thin.
- Reduces risk that one workflow diverges (e.g. forgetting a consistent error return behavior).

---

## 6) `CreateDemoUserUseCase.execute` contains a large transaction script + mapping (extract the transaction body)

### Where it shows up

- `create-demo-user.use-case.ts`:
  - password generation + hashing
  - transactional block with counter increment, validation, identity generation, signup, infra error mapping, dto mapping
  - explicit lint suppression: `biome-ignore ... <extract policy logic>`

### What to extract (high-value)

- Extract the **transaction script** into a dedicated function, e.g.:
  - `create-demo-user.tx.ts` or `create-demo-user.transaction.ts`
- Also consider extracting the **infrastructure error mapping** call (`toSignupUniquenessConflict(...)`) behind a boundary so the use case doesn’t need to know about infrastructure mapping directly.

### Why it’s worth it

- It’s the densest function in the folder, and already marked as “should extract”.
- Makes the use case read as: “prepare inputs → run tx script → log → return”.

---

## 7) Inconsistent logger context patterns (extract a logger factory or normalize constructors)

### Where it shows up

- Some use-cases use `deps.logger.child({ scope, useCase })`
- `login.use-case.ts` uses `logger.withContext("auth:use-case:login-user")`
- `signup.use-case.ts` uses `logger.child({ scope: "use-case", useCase: "createUser" })`

### What to extract

A single helper that produces the logger consistently:

- `makeUseCaseLogger(logger, { module: "auth", useCase: "login" })`

### Why it’s worth it

- Consistent structure makes logs easier to query and reduces “string drift” (`readSession` vs `getSession` vs `session.verify.*` naming).

---

### If you want, I can propose a concrete extraction plan (new helper file names + signatures) that matches your naming conventions (`.helper.ts`, `.policy.ts`, `.workflow.ts`, etc.) and keeps use-cases thin without leaking infrastructure concerns.

---

# Part 2

## Concrete extraction plan (file names + signatures + what changes where)

This plan keeps your “use case = single capability” intent, pushes repetition into **application/helpers** and **application/factories**, and keeps domain policies in **domain/policies**.

I’m proposing **new files** (no edits shown yet), plus a quick “replace usage in X” checklist.

---

## 1) Normalize “read cookie → decode → optional cleanup → validate claims” into one helper

### New file

`src/modules/auth/application/helpers/read-session-token.helper.ts`

### Primary export (signature)

```typescript
export type ReadSessionTokenOutcome =
  | { kind: "missing_token" }
  | { kind: "invalid_token"; didCleanup: boolean }
  | {
      kind: "decoded";
      decoded: { userId?: string; role: string; sessionStart: number };
    };

export async function readSessionToken(
  deps: Readonly<{
    sessionCookieAdapter: {
      get(): Promise<string | undefined>;
      delete(): Promise<void>;
    };
    sessionTokenAdapter: {
      decode(
        token: string,
      ): Promise<{ ok: true; value: any } | { ok: false; error: any }>;
    };
  }>,
  options: Readonly<{
    cleanupOnInvalidToken: boolean;
  }>,
): Promise<
  { ok: true; value: ReadSessionTokenOutcome } | { ok: false; error: any }
>;
```

### Why this shape

- Lets each use case decide _semantics_ (cleanup vs no cleanup), without re-implementing decode branches.
- Avoids forcing `verify-session` to delete cookies when it explicitly says “no side effects”.

### Replace usage

- **`get-session.use-case.ts`**: use `readSessionToken(..., { cleanupOnInvalidToken: true })`
  - `missing_token` → `Ok(undefined)`
  - `invalid_token` → `Ok(undefined)` _unless unexpected should bubble_ (see note below)
  - `decoded` but missing `userId` → cleanup + `Ok(undefined)` (you can handle this via another helper below)
- **`rotate-session.use-case.ts`**: use `readSessionToken(..., { cleanupOnInvalidToken: true })`
  - `missing_token` → `Ok({ reason: "no_cookie", refreshed: false })`
  - `invalid_token` → `Ok({ reason: "invalid_or_missing_user", refreshed: false })`
  - `decoded` → continue
- **`verify-session.use-case.ts`**: use `readSessionToken(..., { cleanupOnInvalidToken: false })`
  - `missing_token` → `Err(makeMissingSessionError())`
  - `invalid_token` → `Err(decodedResult.error)` (no cleanup)
  - `decoded` → validate claims

> Note: today `get-session` treats some decode failures as `Err(unexpected)` but others as `Ok(undefined)`. If you want to preserve that distinction, add an option like `treatUnexpectedDecodeAsError: boolean`, or keep a small branch in `GetSessionUseCase` after the helper returns the decode error.

---

## 2) Extract “require userId claim” into a claim guard helper

### New file

`src/modules/auth/application/helpers/require-session-user-id.helper.ts`

### Primary export

```typescript
export function requireSessionUserId(
  decoded: Readonly<{ userId?: string }>,
): { ok: true; value: { userId: string } } | { ok: false };
```

### Replace usage

- **`get-session.use-case.ts`**: if missing `userId`, cleanup + `Ok(undefined)`
- **`verify-session.use-case.ts`**: if missing `userId`, `Err(makeInvalidSessionClaimsError(...))`
- **`rotate-session.use-case.ts`**: missing `userId` can map to termination / invalid outcome

This keeps “claim required” logic consistent while still allowing different responses.

---

## 3) Centralize cookie set/delete + logging into helper functions (application/helpers)

### New file

`src/modules/auth/application/helpers/session-cookie-ops.helper.ts`

### Primary exports

```typescript
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export async function setSessionCookieAndLog(
  deps: Readonly<{
    logger: LoggingClientContract;
    sessionCookieAdapter: {
      set(token: string, expiresAtMs: number): Promise<void>;
    };
  }>,
  params: Readonly<{
    token: string;
    expiresAtMs: number;
    operationName: string; // e.g. "session.establish.success"
    identifiers: Record<string, unknown>;
    message: string; // e.g. "Session established"
  }>,
): Promise<void>;

export async function deleteSessionCookieAndLog(
  deps: Readonly<{
    logger: LoggingClientContract;
    sessionCookieAdapter: { delete(): Promise<void> };
  }>,
  params: Readonly<{
    operationName: string; // e.g. "session.terminate.success"
    identifiers: Record<string, unknown>;
    message: string;
  }>,
): Promise<void>;
```

### Replace usage

- **`establish-session.use-case.ts`**: replace `set` + log with `setSessionCookieAndLog(...)`
- **`rotate-session.use-case.ts`**:
  - in `handleRotation`: replace `set` + log
  - in `handleTermination`: replace `delete` + (existing log can remain before/after depending on preference)
- **`terminate-session.use-case.ts`**: replace `delete` + success log with `deleteSessionCookieAndLog(...)`; keep error logging in use case (or extend helper to accept `onError`)

---

## 4) Standardize “use-case logger” creation to avoid naming drift

### New file

`src/modules/auth/application/helpers/make-auth-use-case-logger.helper.ts`

### Primary export

```typescript
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function makeAuthUseCaseLogger(
  logger: LoggingClientContract,
  useCase: string,
): LoggingClientContract;
```

### Replace usage

- **All auth use-cases**: replace ad-hoc `child({ scope, useCase })` / `withContext(...)` with:
  - `this.logger = makeAuthUseCaseLogger(deps.logger, "rotateSession")`
  - (or `"rotate-session"`—pick one convention and stick to it)

This keeps log metadata stable and searchable.

---

## 5) Extract “credential failure that is safe to return” into an application factory

### New file

`src/modules/auth/application/factories/make-credential-failure-error.factory.ts`

_(Factory suffix matches your conventions; filename matches export.)_

### Primary export

```typescript
import type { AppError } from "@/shared/errors/core/app-error.entity";

export function makeCredentialFailureError(
  details: Readonly<
    | { reason: "user_not_found"; email: string }
    | { reason: "invalid_password"; userId: string }
  >,
): AppError;
```

### Replace usage

- **`login.use-case.ts`**:
  - Replace both `makeAppError(...)+applyAntiEnumerationPolicy(...)` blocks with `Err(makeCredentialFailureError(...))`

This ensures anti-enumeration is impossible to “forget” in future branches.

---

## 6) DRY up the repeated “authenticate/create user → toSessionPrincipal → establish session” in workflows

### New file

`src/modules/auth/application/use-cases/establish-session-for-auth-user.workflow.ts`

_(Workflow is a multi-step orchestration; this file belongs with workflows.)_

### Primary export

```typescript
import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export async function establishSessionForAuthUserWorkflow(
  authUserResult: Result<AuthUserOutputDto, AppError>,
  deps: Readonly<{ sessionService: SessionAdapterContract }>,
): Promise<Result<SessionPrincipalDto, AppError>>;
```

### Replace usage

- **`login.workflow.ts`**, **`signup.workflow.ts`**, **`create-demo-user.workflow.ts`**:
  - Keep the “first step” (login use case / signup use case / demo use case)
  - Pass the result into `establishSessionForAuthUserWorkflow(...)`

This turns three workflows into: _get auth user → delegate to shared workflow_.

---

## 7) Split the big `CreateDemoUserUseCase` transaction body into a transaction script helper

### New file

`src/modules/auth/application/helpers/create-demo-user.tx.helper.ts`

### Primary export

```typescript
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import type { PasswordGeneratorContract } from "@/modules/auth/domain/services/password-generator.contract";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export async function createDemoUserTx(
  deps: Readonly<{
    uow: UnitOfWorkContract;
    hasher: PasswordHasherContract;
    passwordGenerator: PasswordGeneratorContract;
  }>,
  role: UserRole,
): Promise<Result<AuthUserOutputDto, AppError>>;
```

### Replace usage

- **`create-demo-user.use-case.ts`** becomes mostly:
  - create logger child
  - `const txResult = await createDemoUserTx({...}, role)`
  - log success/fail
  - return

Bonus: you can delete the `biome-ignore ... noExcessiveLinesPerFunction` once extracted.

---

## Suggested implementation order (fastest payoff first)

1. `read-session-token.helper.ts` + update `get-session`, `rotate-session`, `verify-session`
2. `session-cookie-ops.helper.ts` + update `establish-session`, `rotate-session`, `terminate-session`
3. `establish-session-for-auth-user.workflow.ts` + update 3 workflows
4. `make-credential-failure-error.factory.ts` + update `login.use-case`
5. `create-demo-user.tx.helper.ts` + update `create-demo-user.use-case`
6. `make-auth-use-case-logger.helper.ts` + update constructors opportunistically

---

## Two small naming consistency calls (pick one and apply everywhere)

- Use-case identity strings: `"getSession"` vs `"readSession"` vs `"verifySession"`  
  I’d pick **file verb** (e.g. `getSession`, `verifySession`, `rotateSession`) to reduce synonym drift.
- Operation names: you already have `session.rotate.*` / `session.verify.*`—keep that prefixing; the helper should accept `operationName` so callers stay explicit.

---

If you want me to actually draft the new files and the minimal edits to each use-case/workflow, tell me whether you prefer the helper return type to be:

- **`Result<Outcome, AppError>`** (fits your existing Result style), or
- a **non-Result** discriminated union and keep Result at the use-case boundary.
