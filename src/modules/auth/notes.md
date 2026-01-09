# Auth Module Refactoring Notes

## Table of Contents

- [Overview](#overview)
- [Part 1: Extraction Candidates](#part-1-extraction-candidates)
  - [Status Summary](#status-summary)
  - [Item #1: Session Token Reading](#1-repeated-read-cookie--decode-token--handle-failures-logic-partially-extracted)
  - [Item #2: Cookie Operations Logging](#2-session-cookie-setdelete--logging-wrappers-extract-a-small-session-store-operations-helper)
  - [Item #3: Rotate Session Branching](#3-rotatesessionusecase-private-methods-are-doing-workflow-ish-branching-extract-handlers-or-a-workflow)
  - [Item #4: Anti-Enumeration (✓ DONE)](#4-anti-enumeration-error-mapping-at-the-use-case-boundary-completed-)
  - [Item #5: Workflow Repetition](#5-workflows-share-a-repeated-execute--map-to-session-principal--establish-session-pattern-extract-a-shared-workflow-helper)
  - [Item #6: Demo User Transaction](#6-createdemouserusecase-execute-contains-a-large-transaction-script--mapping-extract-the-transaction-body)
  - [Item #7: Logger Normalization](#7-inconsistent-logger-context-patterns-extract-a-logger-factory-or-normalize-constructors)
- [Part 2: Concrete Extraction Plan](#part-2-concrete-extraction-plan)
  - [Implementation Order](#suggested-implementation-order-fastest-payoff-first)
  - [Helpers & Factories](#extraction-targets)
  - [Design Decisions](#two-small-naming-consistency-calls-pick-one-and-apply-everywhere)

---

## Overview

This document identifies **7 main refactoring opportunities** in the auth module's application layer:

- **1 item completed** (#4: Anti-enumeration error factory ✓)
- **6 items pending** (#1–3, #5–7)

Each section describes the problem, proposes a solution, and lists the files that need updates.

**Goal:** Keep use cases thin, prevent repetition, maintain consistency across auth workflows.

---

# Part 1: Extraction Candidates

## Status Summary

| Item | Title                     | Status | Files to Extract                              |
| ---- | ------------------------- | ------ | --------------------------------------------- |
| #1   | Session token reading     | ✓ DONE | `read-session-token.helper.ts`                |
| #2   | Cookie set/delete logging | ✓ DONE | `session-cookie-ops.helper.ts`                |
| #3   | Rotate session branching  | TODO   | Split or convert to workflow                  |
| #4   | Anti-enumeration errors   | ✓ DONE | `auth-error.factory.ts` (exists)              |
| #5   | Workflow repetition       | ✓ DONE | `establish-session-for-auth-user.workflow.ts` |
| #6   | Demo user transaction     | TODO   | `create-demo-user.tx.helper.ts`               |
| #7   | Logger normalization      | ✓ DONE | `make-auth-use-case-logger.helper.ts`         |

Below are the main "repeat/complexity hotspots" in this folder that are good extraction targets (to helpers/policies/services), with **what** to extract and **why**.

---

## 1) Repeated “read cookie → decode token → handle failures” logic (partially extracted)

### Where it shows up

- `get-session.use-case.ts`:
  - `get()` cookie
  - `decode(token)`
  - on decode failure: `cleanupInvalidToken(...)` (already extracted) and then either `Err(unexpected)` or `Ok(undefined)`
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

A small helper (application-layer helper) that centralizes the remaining repetition:

- fetching token from `SessionStoreContract`
- decoding via `SessionTokenServiceContract`
- optionally cleaning up invalid tokens (calling `cleanupInvalidToken`)
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

---

## ✅ 4) Anti-enumeration error mapping at the use-case boundary (COMPLETED)

### Status: Done ✓

**Implementation:**

- `src/modules/auth/application/factories/auth-error.factory.ts` — Factory with `makeCredentialFailure`, `makeSessionRequired`, etc.
- `src/modules/auth/application/use-cases/login.use-case.ts` — Uses the factory consistently

**What works:**

- Login correctly applies anti-enumeration (no "user not found" vs "invalid password" leakage)
- Error reasons logged internally for debugging; public error always `invalid_credentials`

**Impact:**

- Prevents accidental bypass of the anti-enumeration policy
- Makes `LoginUseCase` read like intent instead of mechanics

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
  - uses `safeExecute` for top-level wrapping

### What to extract (high-value)

- Extract the **transaction script** into a dedicated function, e.g.:
  - `create-demo-user.tx.ts` or `create-demo-user.transaction.ts`
- The infrastructure error mapping (`toSignupUniquenessConflict(...)`) is already used, but could be further abstracted.

### Why it’s worth it

- It’s the densest function in the folder.
- Makes the use case read as: “prepare inputs → run tx script → log → return”.

---

## 7) Inconsistent logger context patterns (extract a logger factory or normalize constructors)

### Where it shows up

- Some use-cases use `deps.logger.child({ scope, useCase })`
- `login.use-case.ts` uses `logger.withContext("auth:use-case:login-user")`
- `signup.use-case.ts` uses `logger.child({ scope: "use-case", useCase: "createUser" })`
- `get-session.use-case.ts` uses `readSession` as useCase name while file is `get-session`.

### What to extract

A single helper that produces the logger consistently:

- `makeUseCaseLogger(logger, { module: "auth", useCase: "login" })`

### Why it’s worth it

- Consistent structure makes logs easier to query and reduces “string drift” (`readSession` vs `getSession` vs `session.verify.*` naming).

---

### If you want, I can propose a concrete extraction plan (new helper file names + signatures) that matches your naming conventions (`.helper.ts`, `.policy.ts`, `.workflow.ts`, etc.) and keeps use-cases thin without leaking infrastructure concerns.

---

# Part 2: Concrete Extraction Plan

## Overview

This section proposes **concrete new files** and **how to update existing files** to implement items #1–3, #5–7.

**Architecture principles:**

- Use case = single capability (use `.workflow.ts` for orchestration)
- Extract repetition → `application/helpers` and `application/factories`
- Keep domain logic in `domain/policies`
- Each helper has a single, clear responsibility

**Current state:**

- ✓ Item #4: `auth-error.factory.ts` (exists)
- ✓ Item #1: `read-session-token.helper.ts` (exists)
- ✓ Item #2: `session-cookie-ops.helper.ts` (exists)
- ✓ Item #5: `establish-session-for-auth-user.workflow.ts` (exists)
- ✓ Item #7: `make-auth-use-case-logger.helper.ts` (exists)
- TODO: Items #3, #6 (remaining extractions)

---

## Extraction Targets

| #   | File                                          | Purpose                                    | Affects       |
| --- | --------------------------------------------- | ------------------------------------------ | ------------- |
| 1   | `read-session-token.helper.ts`                | Centralize token reading & decode branches | 3 use-cases   |
| 2   | `require-session-user-id.helper.ts`           | Validate `userId` claim                    | 3 use-cases   |
| 3   | `session-cookie-ops.helper.ts`                | Wrap set/delete + logging                  | 3 use-cases   |
| 4   | `make-auth-use-case-logger.helper.ts`         | Standardize logger creation                | All use-cases |
| 5   | `establish-session-for-auth-user.workflow.ts` | Shared "user → session" pattern            | 3 workflows   |
| 6   | `create-demo-user.tx.helper.ts`               | Extract transaction body                   | 1 use-case    |

---

## 1) Normalize "read cookie → decode → optional cleanup → validate claims" into one helper

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

## Suggested Implementation Order

**Fastest payoff first (recommended sequence):**

1. **`read-session-token.helper.ts`** → Reduces 3 use-cases (`get-session`, `rotate-session`, `verify-session`)
2. **`session-cookie-ops.helper.ts`** → Centralizes logging repetition, affects 3 use-cases
3. **`establish-session-for-auth-user.workflow.ts`** → DRY pattern across 3 workflows
4. ✓ **`auth-error.factory.ts`** (already completed)
5. **`create-demo-user.tx.helper.ts`** → Simplifies densest function
6. **`make-auth-use-case-logger.helper.ts`** → Update constructors opportunistically

---

## Design Decisions

### Return Type Strategy

**Decision:** Use `Result<Outcome, AppError>` for all helpers

- Consistent with existing codebase patterns
- Keeps error handling at use-case boundary

### Use-case Identity Strings

**Problem:** Drift between `"readSession"`, `"getSession"`, `"verifySession"`

**Decision:** Use **file verb** everywhere (e.g., `getSession`, `verifySession`, `rotateSession`)

- Reduces synonym drift
- Maps filename → log context directly
- Use helper: `makeAuthUseCaseLogger(logger, "rotateSession")`

### Operation Names

**Pattern:** Keep existing `session.rotate.*`, `session.verify.*` prefixes

- `session-cookie-ops.helper` requires explicit `operationName` parameter
- Forces intentionality in operation naming
