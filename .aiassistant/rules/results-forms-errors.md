---
apply: always
---

# Results, Errors, and Form Handling Summary

- These instructions can be ignored if they conflict with professional judgment.
- These rules are not absolute; use judgment.

## Purpose

- Keep strict, type‑safe error handling with a dual‑tier model.
    - UI layers always use `AppError`; lower layers may use `BaseError` or an extended variant like `ConflictError`.
- Errors can be values or exceptions, but must be handled explicitly.

## Critical Files

- `src/shared/core/result/result.ts`
- `src/shared/core/result/app-error.ts`
- `src/shared/core/errors/base-error.ts`
- `src/shared/core/errors/adapters/`
- `src/server/forms/validate-form.ts`

## Focus

- Complete implementation for Errors and Results in direction of DAL(DB) → Repo → Service → Action → UI/App before
  expanding to reverse direction (e.g., UI → Action → Service → Repo → DAL).

---

## Best Practices

- No `try/catch` except around async boundaries.
- Never rethrow except at app exit.
- Only the adapter layer converts to `AppError`.
- Use literal `code` enums and freeze errors.
- Never cast to `any`; use adapters at boundaries.
- Only the adapter layer converts to `AppError`.

---

## Result Type

- reference `src/shared/core/result/result.ts`
- Types
    - `Result<TValue, TError extends ErrorLike> = | OkResult<TValue> | ErrResult<TError>`
    - many more ...
- generic result functions for sync/async/iterable.
- existing functions:
    - `Ok<TValue>(value: TValue): Result<TValue, never>`
    - `Err<TError extends ErrorLike>(error: TError): Result<never, TError>`
    - many more...

---

## Error Model

- reference `src/shared/core/errors/base/base-error.ts`
- reference `src/shared/core/errors/domain/domain-errors.ts`
- reference `src/shared/core/errors/app/app-error.ts`
- reference `src/shared/core/result/app-error.ts`
- `BaseError`: internal/logging use, may include context or stack.
- `ConflictError`: example domain error; extend `BaseError`.
- `AppError`: lightweight, JSON-safe, UI displayable.
- type `ErrorLike`: Error or message string.
- Adapters freeze error objects in dev for immutability.
- Never cast to `any`; use `normalizeUnknownError()` adapter.

---

## Forms

- reference `src/shared/forms/types/form-result.types.ts`
- reference `src/server/forms/validate-form.ts`
- Always return dense map to UI; key always exists; value can be empty array or array of strings.
- `validateFormGeneric` attempts to unify all form validation/transformations/normalizations

---

## Unified Adapter APIs (Currently a major source of weakness)

- Adapters need a lot of attention.
- Confirm proper strategy by asking questions.
- Use existing adapter or create a reusable one.

---

## Layer Rules

| Layer   | Error Type            | Strategy                                                        |
|---------|-----------------------|-----------------------------------------------------------------|
| DAL     | BaseError or Variant  | Throw Error                                                     |
| Repo    | BaseError or Variant  | Throw Error                                                     |
| Service | BaseError or Variant  | Catch, use adapter, never throw                                 |
| Action  | ErrorLike or AppError | Use adapter, return UI‑safe `Result` or `FormResult`            |
| UI/App  | ErrorLike or AppError | Check `result.ok` or use `isOk`; map via `ERROR_CODES`/messages |

---

_Last updated: 2025-10-11_
