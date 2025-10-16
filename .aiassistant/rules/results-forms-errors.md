---
apply: off
status: Deprecated
sunset: 2025-11-15
replaced_by:
  - results.md
  - forms.md
  - errors.md
---

# Results, Errors, and Form Handling Rules (Deprecated)

> This combined document is deprecated. See: results.md, forms.md, and errors.md. It remains for historical context until the sunset date.

1. These rules augment Always-On AI Rules (Lite); they do not duplicate them.
2. Use professional judgment for edge cases; document deviations briefly.

## Purpose

1. Enforce strict, type‑safe error and result handling with a dual‑tier model.
2. UI layers consume AppError; lower layers use BaseError or typed variants (e.g., ConflictError).
3. Errors may be values or exceptions, but must be handled explicitly and serialized safely.

## Critical Files

1. src/shared/core/result/result.ts
2. src/shared/core/result/app-error.ts
3. src/shared/core/errors/base-error.ts
4. src/shared/core/errors/adapters/
5. src/server/forms/validate-form.ts

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
7. Log JSON‑safe structures; avoid leaking secrets.

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

## Error Model

1. References:
   - src/shared/core/errors/base/base-error.ts
   - src/shared/core/errors/domain/domain-errors.ts
   - src/shared/core/errors/app/app-error.ts
   - src/shared/core/result/app-error.ts
2. Types and roles:
   - BaseError: internal/logging; may include context/stack; not UI‑safe.
   - Domain variants (e.g., ConflictError) extend BaseError with canonical codes.
   - AppError: lightweight, JSON‑safe, UI displayable (code/kind/message/severity/details?).
   - ErrorLike: Error | string; normalize at boundaries.
3. Rules:
   - Freeze error objects for immutability.
   - Normalize unknown via normalizeUnknownError(); never cast.
   - Use canonical codes; map to severity/kind via metadata.
   - Preserve causality in logs (cause chain) without leaking secrets.

---

## Forms

1. References:
   - src/shared/forms/types/form-result.types.ts
   - src/server/forms/validate-form.ts
2. Contract:
   - Always return dense field error maps to UI (key exists; value is readonly string[]; may be empty).
   - Echo values using display-safe selectors with redaction.
   - validateFormGeneric unifies validation/transform/normalize; prefer using it over ad‑hoc parsing.
3. Error adaptation:
   - Convert AppError to FormResult via a single adapter per feature/domain.
   - Detect targeted conflicts (e.g., email) and emit field‑specific messages; otherwise generic message + dense empty arrays.

---

## Unified Adapter APIs

1. Adapters are the only place to cross tiers:
   - unknown/BaseError → AppError
   - AppError → Result/FormResult
2. Guidelines:
   - Single‑purpose, small, reusable; no feature leakage.
   - Strict inputs/outputs; readonly data; JSON‑safe.
   - Centralize code/kind/severity mapping using metadata helpers.
3. Actions:
   - Audit adapters for unsafe casts; replace with predicates/normalizers.
   - Consolidate duplicate mappers; introduce shared helpers per layer boundary.

---

## Layer Rules

| Layer   | Error Type            | Strategy                                                                  |
| ------- | --------------------- | ------------------------------------------------------------------------- |
| DAL     | BaseError or Variant  | Throw (internal); never return AppError                                   |
| Repo    | BaseError or Variant  | Throw (internal); enrich with domain context                              |
| Service | BaseError or Variant  | Catch at boundary; adapt to AppError; return Result (never throw outward) |
| Action  | ErrorLike or AppError | Adapt to UI‑safe Result or FormResult; no throws to UI                    |
| UI/App  | ErrorLike or AppError | Branch on result.ok; map via ERROR_CODES/messages; never parse BaseError  |

Notes:

1. Only adapters surface AppError.
2. Services/actions must not leak BaseError beyond their boundary.

---

## Implementation Checklist

1. Result
   - Ensure Ok/Err, match, map/flatMap, async variants are exported and typed.
   - Add fromPromise normalization using normalizeUnknownError().
2. Errors
   - Enforce canonical code set; freeze; add type guards (isBaseError, isAppError).
   - Implement appErrorFromCode and fromAppErrorLike for boundary creation.
3. Adapters
   - unknown → BaseError → AppError: one entry point; no any.
   - AppError → FormResult: dense map, targeted conflict handling, safe value echo.
4. Forms
   - validateFormGeneric used in actions; ensure dense output and value redaction.
5. Tests
   - Unit tests per adapter and per Result helper (sync/async).
   - Contract tests for dense map and email conflict scenarios.

---

## Examples (Patterns)

1. Service boundary (async):
   - Try domain call; catch unknown; adapt to AppError; return Err<AppError>.
2. Action to UI:
   - If form, map AppError → FormResult via adapter; else return Result<T, AppError>.
3. UI rendering:
   - if (!result.ok) map via ERROR_CODES; render message; show field errors from dense map.

---

Last updated: 2025-10-16
