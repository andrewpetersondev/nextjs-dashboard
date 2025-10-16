---
apply: manually
patterns:
  - "src/**/core/result/**"
  - "src/server/**/services/**"
  - "src/server/**/actions/**"
exclude:
  - "src/ui/**"
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

3. Provide generic helpers for:

- sync: map/flatMap/match/unwrap with explicit typing
- async: fromPromise, mapAsync, matchAsync
- iterable: allOk/firstErr/reduceResults

4. Keep discriminants stable: ok: true | false only.

---

## Implementation Checklist

1. Result

- Ensure Ok/Err, match, map/flatMap, async variants are exported and typed.
- Add fromPromise normalization using normalizeUnknownError().

---

Last updated: 2025-10-16
