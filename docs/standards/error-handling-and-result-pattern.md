# Error Handling & Result Pattern

The project treats failures as first-class citizens using a "Result-first" approach.

## Failure Classification

- **Expected Failures**: (Validation, "Not Found", Policy violations). Treat as **values**.
- **Unexpected Failures**: (Programmer errors, broken invariants, impossible states). Treat as **exceptions**.

## The Result Pattern

Use `Result` from `@/shared/core/result/result.dto` for all **expected failures**.

### Layer Responsibilities

- **Infrastructure**: Return `Result`. **Never throw** for expected DB or Network failures. Use `normalizePgError` (or similar) to convert technical errors into `AppError` values.
- **Use Cases**: Compose, map, and wrap results. Orchestrate the flow and map technical infrastructure errors into domain-specific business errors.
- **Interface Adapters (Actions)**: Unwrap the `Result` and translate it into a UI response (Redirect, Error message, or `AppErrorJsonDto`).

## Form State Boundary (`useActionState`)

Decided in [ADR 001](../../src/shared/forms/notes/adr/001-model-form-state-as-boundary-dto-with-null-idle.md): **entities in-process, DTOs at the edge, `null` idle**.

- **In-process**: compose with `Result<T, AppError>`. The `TError extends AppError` constraint is load-bearing — do not loosen it, and do not migrate internal layers to DTOs.
- **At the boundary**: `FormResult<T>` is a boundary DTO union, not a `Result` variant. It shares `OkResult` and the `ok` discriminant, but its error side is a serializable `AppErrorJsonDto` (form state must survive Next.js progressive-enhancement serialization).
- **Idle is `null`**: `FormState<T> = FormResult<T> | null` is the full `useActionState` state. Forms pass `null` as the initial value and feedback components early-return on `null`. Actions take `FormState` as `prevState` but return `FormResult` — a submission can never produce idle.

## Error Modeling

- **Single Source of Truth**: All error types must be defined in `@/shared/core/errors/core/catalog/app-error.registry.ts`.
  - This registry defines the `layer`, `severity`, and the `metadataSchema` (Zod).
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
- **`makeUnexpectedError`**: Preferred for wrapping technical exceptions in Infrastructure.
  - Wraps a trigger (the `error` parameter) into an `unexpected` key.
  - Automatically normalizes the trigger and attaches it as the `cause`.
- **`normalizeUnknownToAppError`**: Converts any caught `unknown` into an `AppError`.
  - Use this when you need a generic fallback but don't want to explicitly mark it as "unexpected".

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

## Testing Errors

- Tests must verify the specific `key` and `metadata` (e.g., `pgCode`) returned in the `Err` branch.
- Test files must mirror the implementation: `to-pg-error.test.ts` for `toPgError`.
