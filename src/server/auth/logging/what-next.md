Next step is to actually _use_ the unified error context in the auth stack. In `src/server/auth` I’d tackle it in this order:

---

## 1. Logging helpers: centralize error logging

**Files:** `logging/auth-logger.shared.ts`, `logging/auth-logging.ops.ts`

Goal: make sure all auth errors are logged with the same shape:

- `layer`
- `operation`
- `context`
- `identifiers`
- `correlationId`
- `errorSource`
- `details` (including diagnosticId / table / timestamp when present)

Concrete actions:

1. Add a small helper that takes:

- `AuthLayerContext`
- `errorSource: AuthErrorSource`
- `error: unknown`
- optional `details: Record<string, unknown>`

2. Inside that helper, build the log payload using:

- properties from `AuthLayerContext`
- `toErrorContext(ctx, extras)` for error details when you have them

3. Update call sites inside `logging/*` (and later in actions/services) to use this helper instead of ad‑hoc error logging payloads.

Result: anywhere in `src/server/auth` that logs an error uses a single, consistent “auth error log” format.

---

## 2. Infrastructure layer: use `toErrorContext` when constructing errors

**Files (under `infrastructure/`):** DAL/repository implementations and transaction helpers.

Goal: every `BaseError`/`DatabaseError` created in auth infra carries the unified `ErrorContext`.

Concrete actions:

1. In DAL/repo methods that detect database failures or wrap underlying errors:

- They already have or can obtain an `AuthLayerContext<"infrastructure.dal">` or `<"infrastructure.repository">`.
- When throwing/constructing a `DatabaseError` (or similar), pass:

```textmate
new DatabaseError(message, toErrorContext(authCtx, {
       diagnosticId,
       table,
       timestamp: new Date().toISOString(),
       // any other DAL-specific metadata
     }), cause);
```

2. Ensure any custom error factories in infra also take an `AuthLayerContext` and convert it to `ErrorContext` via `toErrorContext`.

Result: infra errors are all `BaseError`/`DatabaseError` + a single context shape.

---

## 3. Services: stop inventing their own error context shapes

**Files:** `application/services/**`

Goal: services either:

- propagate `AppError` / `BaseError` from infra, or
- create their own `AppError` with plain details objects (no layer-specific context types).

Concrete actions:

1. When a service converts infra errors to `AppError` (e.g. using mapping functions under `shared/result/app-error` or similar):

- Do **not** introduce service-specific context interfaces.
- If you need extra debug info, put it into the `details`/`extra` object of the `AppError` as a plain record.

2. If services log errors directly, use the logging helper from step 1 with their `AuthLayerContext<"service">`.

Result: services become a thin transform layer; they don’t add any new context type, only data.

---

## 4. Application actions: rely on `AppError` and unified logging

**Files:** `application/actions/*.ts`

Goal: actions only:

- log using `AuthLayerContext<"action">` + unified logging helpers
- map `AppError` → form state / redirects

Concrete actions:

1. For error logging in actions, switch to the new logging helper from step 1 with their `AuthLayerContext<"action">`.
2. Make sure actions never inspect DAL-specific error context; they should look only at:

- `AppError.code`
- `AppError.message`
- `AppError.details` (for fieldErrors or safe metadata)

Result: actions don’t care where an error originated; they just use `AppError`.

---

## 5. Domain layer: share the same conventions, but minimal changes

**Files:** `domain/**`

Goal: domain errors that end up as `AppError` or `BaseError` don’t define special context types either.

Concrete actions:

- When domain code needs context, use:
  - `AppError` details (`extra`, `fieldErrors`, etc.), or
  - a generic `ErrorContext` if it throws a `BaseError` directly.

---

To fully enforce “actions never inspect DAL-specific error context” there, the remaining checklist is:
In error branches, only use:
error.code
error.message
error.details (for fieldErrors / metadata)
Do not read error.context, error.cause, diagnosticId, or any DAL/infrastructure–specific fields.
If you paste the full bodies of loginAction and signupAction, I can align them precisely with that rule and the same logging pattern as above.

If you’d like a quick follow-up, I can also add a small helper to centralize:
AppError → { message, fieldErrors } mapping for form actions,
using error.details.fieldErrors where present, falling back to a generic message.
