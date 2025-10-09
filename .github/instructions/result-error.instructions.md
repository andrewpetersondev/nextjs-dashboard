---
applyTo: '**'
description: 'Result and error modeling, handling, and mapping guidelines for Next.js + TypeScript'
---

# Result & Error Handling Summary

- These instructions can be ignored if they conflict with professional judgement.
- These rules are not absolute; use judgement.

## Purpose

- Keep strict, type‑safe error handling with a dual‑tier model.
- UI layers always use `AppError`; lower layers may use `BaseError` or an extended variant like `ConflictError`.
- Attach when editing `result.ts`, `error.ts`, or `src/shared/core/errors/adapters/app-error-adapters.ts`.
- Errors can be values or exceptions, but must be handled explicitly.

## Focus

- Complete implementation for Errors and Results in direction of DAL(DB) → Repo → Service → Action → UI/App before
  expanding to reverse direction (e.g., UI → Action → Service → Repo → DAL).

---

## Best Practices

- No `try/catch` except around async boundaries.
- Never rethrow except at app exit.
- Only the adapter layer converts to `AppError`.
- Use literal `code` enums and freeze errors in dev (`!IS_PROD`).
- Never cast to `any`; use `toAppErrorFromUnknown()` adapter at boundaries.
- Only the adapter layer converts to `AppError`.

---

## Result Type

- reference `src/shared/core/result/result.ts`
- Types
    - `Result<TValue, TError extends ErrorLike> = | OkResult<TValue> | ErrResult<TError>`
    - many more ...
- generic result functions for sync/async/iterable.
- existing functions:
    - `Ok<TValue, TError extends ErrorLike = AppError>(value: TValue): Result<TValue, TError>`
    - `Err<TValue, TError extends ErrorLike = AppError>(error: TError): Result<TValue, TError>`
    - many more...

---

## Error Model

- reference `src/shared/core/errors/base/base-error.ts`
- reference `src/shared/core/errors/domain/domain-errors.ts`
- reference `src/shared/core/errors/app/error.ts`
- reference `src/shared/core/result/error.ts`
- `BaseError`: internal/logging use, may include context or stack.
- `ConflictError`: example domain error; extend `BaseError`.
- `AppError`: lightweight, JSON-safe, UI displayable.
- type `ErrorLike`: Error or message string.
- Adapters freeze error objects in dev for immutability.
- Never cast to `any`; use `normalizeUnknownError()` adapter.

---

## Unified Adapter APIs (Currently a major source of weakness)

- reference `src/shared/core/errors/adapters/app-error-adapters.ts`

- `toAppErrorFromUnknown`: converts unknown to `AppError`.
- `augmentAppError`:
- `withAppErrorPatch`
- `normalizeToBaseError`
- `toBaseErrorFromUnknown`
- `appErrorFromCode`
- `liftToAppError`: wraps sync function, returns `Result<T, AppError>`.
- many more...

---

## Layer Rules

| Layer   | Error Type            | Strategy                                          |
|---------|-----------------------|---------------------------------------------------|
| DAL     | BaseError or Variant  | Return `Result` with `BaseError`; wrap unknown    |
| Repo    | BaseError or Variant  | Map DAL → domain                                  |
| Service | BaseError or Variant  | Combine results, never throw                      |
| Action  | ErrorLike or AppError | Use `liftToAppError`, return UI‑safe `Result`     |
| UI/App  | ErrorLike or AppError | Check `result.ok`; map via `ERROR_CODES`/messages |

---

Last updated: 2025-10-09
