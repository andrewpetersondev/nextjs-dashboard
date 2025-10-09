// File: src/shared/core/result/iter/result-collect-iter.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Ok, type Result } from "@/shared/core/result/result";

/**
 * Iterates over the results in the provided iterable, yielding values for successful results and stopping at the first error.
 *
 * @param source - An iterable of `Result` objects containing values or errors.
 * @returns A generator yielding successful values or returning the first error encountered.
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
 * Collects all successful `Result` values from the given iterable lazily.
 *
 * @typeParam TValue - The type of the successful result values.
 * @typeParam TError - The type of the error, extending `ErrorLike`. Defaults to `AppError`.
 * @param source - An iterable of `Result` objects to process.
 * @returns A successful `Result` containing an array of values, or the first encountered error.
 * @example
 * const results = collectAllLazy([Ok(1), Ok(2), Err(new AppError("Error"))]);
 * // Returns: Err(new AppError("Error"))
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
