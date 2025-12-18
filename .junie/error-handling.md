---
apply: always
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
