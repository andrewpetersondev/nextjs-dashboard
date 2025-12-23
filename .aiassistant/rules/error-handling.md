---
apply: by file patterns
patterns: src/shared/errors/**/*.ts
---

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

## Error Modeling

- **No Custom Subclasses**: Use the error factory in `@/shared/errors/factories/app-error.factory`.
- **Error Codes**: Use stable string codes instead of `instanceof` checks.
- **Throwing**: Use `throw` **only** for programmer errors or invariant violations.

## Testing Errors

- Tests should verify that the correct error code is returned in the `Err` branch of a `Result`.
- Test files must mirror the unit name: `to-pg-error.test.ts` for `toPgError`.

## Error Factories & Normalizers

All failures must be expressed as `AppError` with explicit metadata. Callers must always pass a `metadata` object (use `{}` if no additional details are available).

### Specialized Factories vs `makeAppError`

- Use `makeValidationError` for:
  - Forms
  - Command/DTO validation
  - Policy checks where the caller can correct input
- Use `makeIntegrityError` for:
  - DB invariants that might be user‑correctable (duplicate email, foreign key that the caller can fix)
- Use `makeInfrastructureError` for:
  - Network / filesystem / configuration / external system issues that are expected but technical
- Use `makeUnexpectedError` only for:
  - Truly impossible cases, programmer errors, invariant violations
  - Callers MUST provide a `metadata` object, even if empty (`{}`), to keep intent explicit
- Use `makeAppError` directly only when:
  - You are inside a very generic, cross‑cutting area (for example, central registry migrations) where the specialized factories do not fit

### Error Normalizers

Use dedicated normalizers at infrastructure boundaries so we never lose intrinsic pgErrorMetadata:

- Use `normalizePgError` **only at Postgres boundaries**:
  - Preserves intrinsic PG pgErrorMetadata (for example, `pgCode`, `constraint`, `table`, `column`)
  - Returns an `AppError` with the correct pgCode for the PG pgCondition, or a fallback pgCode when unmapped
- Use `normalizeUnknownToAppError` at **non‑Postgres boundaries**:
  - HTTP clients
  - File system
  - Third‑party SDKs
  - Wraps any unknown thrown value into an `AppError` with a stable fallback pgCode and diagnostic pgErrorMetadata

Do **not** use `normalizeUnknownToAppError` for Postgres errors, or you will lose `pgCode` and pgCondition mapping.

## Database Access Layer (DAL) Conventions

DAL wrappers are the only place that may catch raw database errors.

- Use `executeDalResult` for **expected DB failures**:
  - Catches raw Postgres errors.
  - Calls `normalizePgError`.
  - Returns `Result<Ok, AppError>` with a mapped error pgCode and PG pgErrorMetadata.
  - Logs the error but does **not** throw.

- Use `executeDalThrow` only for **unexpected DAL invariants**:
  - Wraps unknown errors with `makeUnexpectedError`.
  - Logs and rethrows the `AppError`.
  - Callers should treat this as a bug or invariant violation, not a normal control path.

Application services and use cases must not talk to the DB directly; they call the DAL, receive `Result<_, AppError>`, and map/compose at the application layer.
