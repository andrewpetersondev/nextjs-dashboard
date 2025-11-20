Here’s a concrete conventions doc you can drop into your repo, followed by a couple of targeted refactors that align with it.

---

## 1. Error conventions doc (`src/shared/errors/README.md`)

# Error Handling Conventions

This project uses a canonical `BaseError` type backed by `APP_ERROR_MAP`.  
To keep errors consistent and debuggable, follow these rules.

---

## 1. When to use which helper

### 1.1. Originating a new error (you are the source)

Use **factories** from `base-error.factory.ts`:

- `makeValidationError`
- `makeMissingFieldsError`
- `makeInvalidCredentialsError`
- `makeIntegrityError`
- `makeConflictError`
- `makeDatabaseError`
- `makeNotFoundError`
- `makeUnauthorizedError`
- `makeForbiddenError`
- `makeParseError`
- `makeInfrastructureError`
- `makeUnexpectedError`
- `makeUnknownError`
- `makeBaseError(code, options)` as a generic escape hatch

**Rule:**  
If you are enforcing a domain rule / invariant / business constraint, prefer a
semantic factory over constructing `BaseError` manually.

Example (service / domain):

```ts
return Err(
  makeInvalidCredentialsError({
    context: {
      operation: "login",
      reason: "invalid_credentials_password_mismatch",
    },
    fieldErrors: {
      email: ["invalid_credentials"],
      password: ["invalid_credentials"],
    },
    formErrors: ["Invalid credentials"],
  }),
);
```

Example (DAL invariant you are enforcing yourself):

```ts
if (!userRow) {
  throw makeIntegrityError({
    message: "Invariant: insert did not return a row",
    context: toErrorContext(dalContext, { kind: "invariant" }),
  });
}
```

---

### 1.2. Wrapping an existing error (you received an error)

Use **`BaseError.wrap`**:

```ts
throw BaseError.wrap(
  "database",
  err,
  {
    operation: "insertUser",
    queryName: "insert_user",
  },
  "Failed to insert user",
);
```

**Use `wrap` when:**

- You are not the original source of the error (e.g., DB, PG, external API, lower-level module).
- You want to:
  - Attach a canonical code,
  - Preserve the original error as `cause`,
  - Add context about the current layer.

**Do NOT** construct `BaseError` directly in these scenarios; always use `wrap`.

---

### 1.3. Normalizing unknown values at boundaries

Use **`normalizeToBaseError`** when you are at a boundary and may see any thrown value:

- Top of a service method that returns `Result<..., BaseError>`.
- API/controller boundaries that catch arbitrary errors.

```ts
import { normalizeToBaseError } from "@/shared/errors/error.utils";

try {
  // ... service logic ...
} catch (err: unknown) {
  const baseError = normalizeToBaseError(err, "unexpected");
  return Err(baseError);
}
```

**Guideline for `fallbackCode`:**

- Service / application boundaries: use `"unexpected"` (we didn’t anticipate this path).
- Truly generic / legacy utilities: `"unknown"` is acceptable.

---

### 1.4. Async wrappers

For reusable async boundaries, use helpers from `error.utils.ts`:

- `_catchAsyncBase(fn, fallbackCode?)` → `[result, BaseError | null]`
- `_wrapAsyncBase(code, fn, baseContext?, message?)` → returns a wrapped function

Example:

```ts
const runWithUnexpected = _wrapAsyncBase(
  "unexpected",
  async (input: SomeInput) => {
    // ... body ...
  },
  { operation: "someOperation" },
  "Operation failed unexpectedly",
);
```

---

## 2. Layer-specific guidance

### 2.1. DAL / infrastructure

- **When wrapping DB / PG / external errors**: use `BaseError.wrap("database" | "infrastructure" | "integrity", err, context, message?)`.
- **When asserting invariants you define (e.g., row must not be null)**:
  - Use a semantic factory like `makeIntegrityError` (preferred),
  - Or `BaseError.wrap("integrity", new Error("Invariant message"), context)` if you explicitly want an `Error` cause.

### 2.2. Services

- For domain semantics and UX-facing errors: use factories like:
  - `makeMissingFieldsError`
  - `makeInvalidCredentialsError`
  - `makeUnexpectedError`, etc.
- At the service boundary (`catch` blocks in service methods):
  - Normalize any unknown error to `BaseError` with `normalizeToBaseError(err, "unexpected")`.
  - Return `Result<..., BaseError>` rather than throwing where feasible.

### 2.3. API / controllers

- Catch **once** at the top-level boundary.
- Normalize to `BaseError`:
  ```ts
  const base = normalizeToBaseError(err, "unexpected");
  ```
- Convert to transport / HTTP shape via serializers (e.g. `toJson`).

---

## 3. What to avoid

- Avoid `new BaseError(...)` in application code.  
  Prefer:
  - Factories (`makeXxxError`) when originating errors,
  - `BaseError.wrap` when wrapping,
  - `normalizeToBaseError` / `_wrapAsyncBase` at boundaries.

- Avoid mixing arbitrary fallback codes:
  - Be intentional: `"unexpected"` vs `"unknown"` vs domain-specific codes (`"database"`, `"integrity"`, etc.).

---

## 4. Quick decision checklist

1. **Am I the origin of this error?**
   - Yes → use a factory (`makeXxxError`).

2. **Am I wrapping an error from another layer / library?**
   - Yes → use `BaseError.wrap(code, err, context, message?)`.

3. **Am I at a boundary where I can receive anything?**
   - Yes → use `normalizeToBaseError(err, fallbackCode)` or `_wrapAsyncBase`.

If unsure, prefer a factory over `new BaseError` and prefer `wrap` over manually copying `cause`.

---

## 2. Targeted refactors to align with the conventions

### 2.1. Service catch blocks: normalize via `normalizeToBaseError` with `"unexpected"`

Adjust the service catch blocks to use `normalizeToBaseError(err, "unexpected")` instead of `BaseError.from(err, "unknown")`.

```typescript
// ... existing code ...
    import { demoUserCounter } from "@/server/auth/infrastructure/repository/dal/demo-user-counter";
    import {
      type AuthLogLayerContext,
      createAuthOperationContext,
    } from "@/server/auth/logging-auth/auth-layer-context";
    import { getAppDb } from "@/server/db/db.connection";
    import { BaseError } from "@/shared/errors/base-error";
    import {
      makeInvalidCredentialsError,
      makeMissingFieldsError,
      makeUnexpectedError,
    } from "@/shared/errors/base-error.factory";
    import type { LoggingClientContract } from "@/shared/logging/logger.contracts";
    import type { Result } from "@/shared/result/result";
    import { Err, Ok } from "@/shared/result/result";
    import { normalizeToBaseError } from "@/shared/errors/error.utils";
// ... existing code ...
          const demoUser = await this.repo.withTransaction(async (txRepo) =>
            txRepo.signup({
              email: uniqueEmail,
              password: passwordHash,
              role,
              username: uniqueUsername,
            }),
          );

          log.info("Demo user created", {
            email: uniqueEmail,
            identifiers: serviceContext.identifiers,
            operation: serviceContext.operation,
            role,
            username: uniqueUsername,
          });

          return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
        } catch (err: unknown) {
          log.error("Failed to create demo user", {
            error: err,
            identifiers: serviceContext.identifiers,
            operation: serviceContext.operation,
          });

          const normalized = normalizeToBaseError(err, "unexpected");

          return Err(normalized);
        }
      }
// ... existing code ...
        try {
          const passwordHash = await this.hasher.hash(input.password);

          const userRow = await this.repo.withTransaction(async (txRepo) =>
            txRepo.signup({
              email: input.email,
              password: passwordHash,
              role: toUserRole("USER"),
              username: input.username,
            }),
          );

          log.info("Signup succeeded", {
            email: input.email,
            identifiers: serviceContext.identifiers,
            operation: serviceContext.operation,
            username: input.username,
          });

          return Ok<AuthUserTransport>(toAuthUserTransport(userRow));
        } catch (err: unknown) {
          log.errorWithDetails("Signup failed", err, {
            identifiers: serviceContext.identifiers,
            operation: serviceContext.operation,
          });

          const baseError = normalizeToBaseError(err, "unexpected");

          return Err(baseError);
        }
      }
// ... existing code ...
        try {
          const user = await this.repo.login({ email: input.email });

          if (!user) {
            log.warn("Login failed - invalid credentials", {
              identifiers: serviceContext.identifiers,
              operation: serviceContext.operation,
              reason: "invalid_credentials_user_not_found_or_no_password",
            });

            return Err(
              makeInvalidCredentialsError({
                context: {
                  operation: serviceContext.operation,
                  reason: "invalid_credentials_user_not_found_or_no_password",
                },
                fieldErrors: {
                  email: ["invalid_credentials"],
                  password: ["invalid_credentials"],
                },
                formErrors: ["Invalid credentials"],
              }),
            );
          }
// ... existing code ...
          log.info("Login succeeded", {
            identifiers: {
              ...serviceContext.identifiers,
              userId: String(user.id),
            },
            operation: serviceContext.operation,
          });

          return Ok<AuthUserTransport>(toAuthUserTransport(user));
        } catch (err: unknown) {
          log.error("Login failed", {
            error: err,
            identifiers: serviceContext.identifiers,
            operation: serviceContext.operation,
          });

          const baseError = normalizeToBaseError(err, "unexpected");

          return Err(baseError);
        }
      }
    }
// ... existing code ...
```

This keeps all service boundaries consistent and uses `"unexpected"` as the semantic fallback.

---

### 2.2. DAL invariants: use `makeIntegrityError` for locally-originated invariants

You’re currently using `BaseError.wrap("integrity", new Error(...), ...)` for DAL invariants that you yourself are originating. Per the conventions, you can simplify that to `makeIntegrityError(...)`.

#### `insert-user.dal.ts`

```typescript
// ... existing code ...
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
  toErrorContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthDalLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { BaseError } from "@/shared/errors/base-error";
import type { LoggingClientContract } from "@/shared/logging/logger.contracts";
import { makeIntegrityError } from "@/shared/errors/base-error.factory";
// ... existing code ...
const [userRow] = await db
  .insert(users)
  .values({ email, password, role, username } satisfies NewUserRow)
  .returning();

if (!userRow) {
  throw makeIntegrityError({
    message: "Insert did not return a row",
    context: toErrorContext(dalContext, {
      kind: "invariant",
    }),
  });
}
// ... existing code ...
```

#### `demo-user-counter.ts`

```typescript
// ... existing code ...
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { BaseError } from "@/shared/errors/base-error";
import { logger } from "@/shared/logging/logger.shared";
import { makeIntegrityError } from "@/shared/errors/base-error.factory";
// ... existing code ...
const [counterRow] = await db
  .insert(demoUserCounters)
  .values({ count: 1, role })
  .returning();

if (!counterRow) {
  logger.operation(
    "error",
    "Invariant failed: demoUserCounter did not return a row",
    {
      context: dalContext.loggerContext,
      identifiers: dalContext.identifiers,
      kind: "invariant" as const,
      operationName: dalContext.operation,
    },
  );
  throw makeIntegrityError({
    message: "Invariant: insert did not return a row",
    context: toErrorContext(dalContext, {
      kind: "invariant",
    }),
  });
}

if (counterRow.id == null) {
  logger.operation("error", "Invalid counter row returned: missing id", {
    context: dalContext.loggerContext,
    counterRow,
    identifiers: dalContext.identifiers,
    kind: "invariant" as const,
    operationName: dalContext.operation,
  });
  throw makeIntegrityError({
    message: "Invariant: demo user counter row returned with null id",
    context: toErrorContext(dalContext, {
      counterRow,
      kind: "invariant",
    }),
  });
}
// ... existing code ...
```

These changes make it clearer that:

- The DAL is the **originator** of these invariants (`makeIntegrityError`),
- Services **normalize at their boundaries** via `normalizeToBaseError(..., "unexpected")`,
- And **wrapping** is reserved for when you are actually wrapping someone else’s error.

If you’d like, we can follow up by applying the same pattern to other DAL / infra modules and then create a small lint rule or code mod checklist to keep new code aligned.
