---
apply: always
---

# Result & Error Handling Rules

## Purpose

Enforce consistent, type-safe result and error handling across all modules.  
Reference [TypeScript Instructions](./typescript.md) for strictness and discriminated union rules.

## Result Modeling

- Use discriminated unions for all operations that can fail:
    - `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };`
- Prefer explicit result types in all exports; avoid inferred anonymous types.
- For async operations, use `Promise<Result<T, E>>` and handle both paths.
- Use result helpers (`result.ts`, `result-async.ts`, etc.) for mapping, collecting, and transforming results.
- Never rely on presence checks of `error` or `value` alone; always discriminate via the `ok` flag.

## Error Modeling

- Model errors as discriminated unions or domain-specific error classes.
- Use explicit error codes and messages (`error-codes.ts`, `error-messages.ts`).
- Prefer domain errors (`domain-error.ts`) for business logic; infrastructure errors for system failures.
- Never leak internal error details or stack traces across API boundaries.
- Use error factories and mappers to normalize external/library errors into app-specific error shapes.
- Redact sensitive information using error redaction utilities before logging or surfacing errors.

## Integration Details

- Canonical locations:
    - src/shared/core/result for Result helpers (sync/async, mapping, collection).
    - src/shared/core/errors for domain/infrastructure error shapes and factories.
- Standard infrastructure error union:
    - NetworkError | AuthError | DbError | ValidationError | UnknownError
    - Each must have a stable `code` and safe `message`.
- External error mappers:
    - Normalize errors from authentication, database, and cryptography libraries into the standard union before
      surfacing.
- API boundaries:
    - Map internal errors to { code, message } safe DTOs; never include stack, cause, or PII.

## Review Checklist

- All result and error handling uses discriminated unions.
- Errors are normalized, redacted, and logged with context.
- No internal details or stack traces leak to clients.
- All exported result/error types are explicit and documented.
- Form error mapping is consistent and i18n-ready.
- Canonical helper locations are used; external errors are mapped to the standard union.

_Last updated: 2025-10-05_
