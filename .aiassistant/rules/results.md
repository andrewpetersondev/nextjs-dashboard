---
apply: manually
---

# Result Handling Rules

## Purpose

1. Enforce strict, type‑safe result handling.

## Critical Files

1. src/shared/core/result/result.ts

## Scope Focus

1. Implement end-to-end flow DAL(DB) → Repo → Service → Action → UI/App.
2. Only after stabilization, expand reverse direction (UI → Action → Service → Repo → DAL).

---

## Best Practices

1. Use try/catch only at async boundaries (service/action edges).
2. Do not rethrow except at process shutdown.
3. Only the adapter layer converts unknown/BaseError to AppError.
4. Use literal error codes (enums/union literals); freeze errors.
5. Do not use any; normalize via adapters at boundaries.
6. Prefer type guards and predicates over casts.

---

## Result Type

1. Reference: src/shared/core/result/result.ts
2. Types:

- Result<TValue, TError extends ErrorLike> = OkResult<TValue> | ErrResult<TError>
- Ok<TValue>(value: TValue): Result<TValue, never>
- Err<TError extends ErrorLike>(error: TError): Result<never, TError>

3. Available helpers (from code):

- Ok(value), Err(error)
- isOk(result), isErr(result)
- toNullable(result)
- fromCondition(condition, onFalse)
- toFlags(result) → [isOk, isErr] tuple

4. Discriminants are stable: ok: true | false only.

---

## Implementation Checklist

1. Result

- Ensure Ok/Err, isOk/isErr, toNullable, fromCondition, toFlags are exported and typed.
- Prefer ErrorLike for error typing; use makeErrorMapper when normalizing unknown errors to a specific error shape before constructing Err().

---

## Examples (Patterns)

- Service boundary (async):
  - Try domain call; catch unknown; adapt to AppError; return Err<AppError>.
- Action to UI:
  - If form, map AppError → FormResult via adapter; else return Result<T, AppError>.
- UI rendering:
  - If not ok, map via ERROR_CODES; render message; show field errors from dense map.

## API Reference (from code)

- Types
  - OkResult<TValue> = { ok: true; value: TValue }
  - ErrResult<TError extends ErrorLike> = { ok: false; error: TError }
  - Result<TValue, TError extends ErrorLike> = OkResult<TValue> | ErrResult<TError>
- Constructors
  - Ok<TValue>(value: TValue): Result<TValue, never>
  - Err<TError extends ErrorLike>(error: TError): Result<never, TError>
- Type guards
  - isOk<TValue, TError extends ErrorLike>(r): r is OkResult<TValue>
  - isErr<TValue, TError extends ErrorLike>(r): r is ErrResult<TError>
- Utilities
  - toNullable<TValue, TError extends ErrorLike>(r): TValue | null
  - fromCondition<TError extends ErrorLike>(condition: boolean, onFalse: () => TError): Result<boolean, TError>
  - toFlags<TValue, TError extends ErrorLike>(r): readonly [isOk: boolean, isErr: boolean]
- Error helpers (related)
  - ErrorLike: union of Error or { message: string }
  - makeErrorMapper<TError extends ErrorLike>(opts): (e: unknown) => TError (see src/shared/core/result/app-error.ts)

Notes:

- All results are frozen (shallow) to prevent accidental mutation.
- Discriminant property ok is the only branch key; do not add alternative discriminants.

## Low‑Token Playbook (Results)

1. Prefer flags/guards over pattern matching logic.
   - Use isOk/isErr or toFlags to branch in one line and avoid repeated checks.
2. Normalize once at the boundary.
   - If you need a specific error shape, build a single mapper with makeErrorMapper and reuse it.
3. Keep error payloads small and JSON‑safe.
   - Avoid attaching large objects; prefer code/message and minimal details.
4. Don’t wrap/unwrap repeatedly.
   - Construct Result exactly once per boundary; pass it through.
5. Convert to nullable for optional UI flows.
   - Use toNullable when a simple presence/absence is enough.

## File Pointers

- Core Result: src/shared/core/result/result.ts
- ErrorLike + makeErrorMapper: src/shared/core/result/app-error.ts
- Result → FormResult adapter: src/shared/forms/mapping/result-to-form-result.mapper.ts
