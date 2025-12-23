# Error Handling & Result Pattern

The project treats failures as first-class citizens using a "Result-first" approach.

## Failure Classification

- **Expected Failures**: (Validation, "Not Found", Policy violations). Treat as **values**.
- **Unexpected Failures**: (Programmer errors, broken invariants, impossible states). Treat as **exceptions**.

## The Result Pattern

Use `Result<Ok, Err>` from `@/shared/result` for all **expected failures**.

### Layer Responsibilities

- **Infrastructure (Adapters)**: Return `Result`. **Never throw** for expected DB or Network failures.
- **Application (Services/Use Cases)**: Compose, map, and wrap results. Map technical errors to domain errors.
- **Actions (Boundaries)**: Unwrap the `Result` and translate it into a UI response (Redirect, Error message).

### Async Composition

When composing asynchronous operations, use functional utilities to maintain the `Result` chain:

- **`tapOkAsync` / `tapErrorAsync`**: Execute side effects without altering the result.
- **`tapOkAsyncSafe` / `tapErrorAsyncSafe`**: Execute side effects and catch potential internal failures, mapping them back to an `AppError` via a provided mapper.

## Error Modeling

- **Single Source of Truth**: All error types must be defined in `@/shared/errors/catalog/app-error.registry.ts`.
  - This registry defines the `layer`, `severity`, `retryable` status, and the `metadataSchema` (Zod).
- **No Custom Subclasses**: Always use the `AppError` entity.
- **Error Keys**: Use the `APP_ERROR_KEYS` constants for stability instead of `instanceof` or magic strings.
- **Throwing**: Use `throw` **only** for programmer errors or invariant violations.

## Error Factories & Normalizers

### Metadata Validation

The `AppError` constructor automatically validates and sanitizes `metadata` against the Zod schema defined in the registry for that specific key.

- In **development**, validation failures will throw immediately to catch contract violations.
- In **production**, they are logged but allowed to pass to prevent application crashes.

### Specialized Factories

- **`makeAppError`**: Standard factory for domain/application errors.
- **`makeUnexpectedError`**: Wraps a trigger (the `error` parameter) into an `unexpected` key. It preserves the trigger's properties as the `cause`.
- **`normalizeUnknownToAppError`**: Converts any caught `unknown` (string, Error, etc.) into a structured `AppError`.

### Infrastructure Normalizers

- **`normalizePgError`**: Use **only at Postgres boundaries**.
  - Uses `toPgError` to perform a Breadth-First Search (BFS) through the error chain to find native Postgres codes.
  - Maps `pgCode` to `pgCondition` (e.g., `23505` -> `pg_unique_violation`).
  - Preserves native metadata like `constraint`, `table`, and `column`.

## Database Access Layer (DAL) Conventions

DAL wrappers are the only place permitted to catch raw database errors.

- **`executeDalResult`**:
  - For **expected** failures (e.g., unique constraint violations).
  - Returns `Result<T, AppError>`.
  - Automatically logs the failure with the operation context and identifiers.
- **`executeDalThrow`**:
  - For **unexpected** failures (bugs/invariants).
  - Throws an `AppError` with the `unexpected` key.
  - Useful when a query _must_ succeed for the system to remain in a valid state.

## Testing Errors

- Tests must verify the specific `key` and `metadata` (e.g., `pgCode`) returned in the `Err` branch.
- Test files must mirror the implementation: `to-pg-error.test.ts` for `toPgError`.
