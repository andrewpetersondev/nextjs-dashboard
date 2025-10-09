// File: src/shared/core/result/result-collect-iter.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Ok, type Result } from "@/shared/core/result/result";

/**
 * Lazily iterates over `Ok` values from `source` and short‑circuits on the first `Err`.
 * - Yields each `Ok` value as it is encountered.
 * - On the first `Err`, stops iteration and returns that `Err` as the generator’s return value.
 * - If no `Err` occurs, completes with `Ok<void>`.
 * Preserves `TError`; default is `AppError`.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type; defaults to `AppError`.
 * @param source Iterable of `Result<TValue, TError>`.
 * @returns `Generator<TValue, Result<void, TError>>` — yields Ok values; returns the first Err or `Ok<void>` if none.
 */
export function* iterateOk<TValue, TError extends ErrorLike = AppError>(
  source: Iterable<Result<TValue, TError>>,
): Generator<TValue, Result<void, TError>, unknown> {
  for (const r of source) {
    if (!r.ok) {
      return r as Result<void, TError>;
    }
    yield r.value;
  }
  return Ok<void, TError>(undefined);
}

/**
 * Collects all `Ok` values from `source` until the first `Err`.
 * - On the first `Err`, returns that `Err` immediately (no further iteration).
 * - If all entries are `Ok`, returns `Ok<readonly TValue[]>`.
 * Preserves `TError`; does not normalize or remap errors.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type; defaults to `AppError`.
 * @param source Iterable of `Result<TValue, TError>`.
 * @returns `Result<readonly TValue[], TError>` — array of all Ok values or the first Err.
 */
export const collectAllLazy = /* @__PURE__ */ <
  TValue,
  TError extends ErrorLike = AppError,
>(
  source: Iterable<Result<TValue, TError>>,
): Result<readonly TValue[], TError> => {
  const acc: TValue[] = [];
  for (const r of source) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly TValue[]);
};
