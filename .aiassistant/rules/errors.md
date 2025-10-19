---
apply: always
---

# Error Modeling Rules

## Purpose

1. Define a consistent, type‑safe, JSON‑safe error model across layers.
2. Keep UI concerns (AppError) separate from internal/logging concerns (BaseError + variants).

## Precedence

- See: project-rules.md (governance, activation, authoring)
- See: results.md (Result helpers and usage)
- See: forms.md (FormResult adaptation)

## Rules

1. Use a canonical BaseError with literal `code` and immutable instances (frozen); add type guards (e.g., `BaseError.is`).
2. Derive domain error variants from BaseError with a closed set of codes per domain.
3. Never leak BaseError beyond service boundaries; adapt to AppError at adapters.
4. AppError is lightweight and JSON‑safe: { code, kind, message, severity, details? } only.
5. Normalize unknown values to BaseError at boundaries; do not cast to `any`.
6. Preserve `cause` internally for logging; redact secrets in any `details`.
7. Centralize code→kind/severity mapping in a single adapter helper per boundary.

## Implementation Notes

- References:
  - src/shared/core/errors/base/base-error.ts
  - src/shared/core/errors/domain/\*
  - src/shared/core/errors/app/app-error.ts
- Adapters are the only tier-crossing points:
  - unknown/BaseError → AppError
  - AppError → Result/FormResult

## Low‑Token Playbook (Errors)

- Normalize at boundaries once; avoid multiple conversions between BaseError/AppError.
- Use provided builders/normalizers; don’t re-implement mapping logic.
- Keep error payloads tiny: prefer code + message; only small details when strictly needed.
- Request only the function ranges you need when editing error adapters; don’t open full files.

## Adapter Boundaries

- Adapters are the only tier-crossing points. They perform:
  - unknown/BaseError → AppError
  - AppError → Result/FormResult
- Guidelines for adapters:
  - Keep them single‑purpose, small, and reusable; avoid feature leakage.
  - Enforce strict inputs/outputs; use readonly, JSON‑safe data only.
  - Centralize code→kind/severity mapping using metadata helpers.

## Layer Rules

- DAL
  - Error type: BaseError or domain variant
  - Strategy: Throw internally; never return AppError
- Repo
  - Error type: BaseError or domain variant
  - Strategy: Throw internally; enrich with domain context
- Service
  - Error type: BaseError or domain variant
  - Strategy: Catch at boundary; adapt to AppError; return Result (never throw outward)
- Action
  - Error type: ErrorLike or AppError
  - Strategy: Adapt to UI‑safe Result or FormResult; no throws to UI
- UI/App
  - Error type: ErrorLike or AppError
  - Strategy: Branch on result.ok; map via ERROR_CODES/messages; never parse BaseError

Notes:

- Only adapters surface AppError.
- Services/actions must not leak BaseError beyond their boundary.

## Implementation Checklist (Errors)

- Enforce a canonical code set; freeze instances; add type guards (e.g., isBaseError, isAppError).
- Implement appErrorFromCode and fromAppErrorLike for boundary creation.
- Ensure a single entry point for unknown → BaseError → AppError normalization; avoid any.

## Logging + Redaction (server-only)

- Use logError for structured emission
  - Source: src/shared/core/errors/logging/error-logger.ts (logError, StructuredErrorLog)
  - Provide operation and extra context; the emission object is frozen.
- Redact by default
  - Use defaultErrorContextRedactor or createErrorContextRedactor from src/shared/core/errors/redaction/redaction.ts.
  - Never attach secrets/PII to error.context; rely on redaction to mask residuals.
- When you only have unknown
  - Prefer logUnknownAsBaseError(logger, err, extra?) which normalizes via BaseError.from and applies default redaction.

## Adapters and normalization (from code)

- Normalize at boundaries
  - unknown → BaseError: BaseError.from(value, "UNKNOWN", context) or BaseError.wrap(code, value, context, message)
  - BaseError/AppError-like → AppError: toAppErrorFromUnknown (src/shared/core/errors/app-error/app-error-normalizers.ts)
  - Known code → AppError: appErrorFromCode(code, message?, details?) (src/shared/core/errors/app-error/app-error-builders.ts)
- Lift async functions that might throw into Result<T, AppError>
  - liftToAppError(fn) returns a function that resolves to Ok/Err with AppError on failure.
- Type guards
  - isBaseError, isErrorWithCode, isRetryableError (src/shared/core/errors/base/error-guards.ts)

## File pointers

- BaseError: src/shared/core/errors/base/base-error.ts
- Error codes/meta: src/shared/core/errors/base/error-codes.ts
- Guards: src/shared/core/errors/base/error-guards.ts
- AppError type: src/shared/core/result/app-error.ts
- AppError builders/normalizers: src/shared/core/errors/app-error/app-error-builders.ts, app-error-normalizers.ts
- Logging: src/shared/core/errors/logging/error-logger.ts
- Redaction: src/shared/core/errors/redaction/redaction.ts
