// File: src/shared/core/result/iter/result-collect-iter.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Iterates over the source, yielding values from successful results until an error result is encountered.
 *
 * @param source - An iterable of `Result` objects to process.
 * @typeParam TValue - The type of successful values in the result.
 * @typeParam TError - The type of error to handle, extending `ErrorLike`.
 * @returns A generator that yields successful values, or an error result if one is encountered.
 */
export function* iterateOk<TValue, TError extends ErrorLike = AppError>(
  source: Iterable<Result<TValue, TError>>,
): Generator<TValue, Result<void, TError>, unknown> {
  for (const r of source) {
    if (!r.ok) {
      return Err(r.error);
    }
    yield r.value;
  }
  return Ok<void>(undefined);
}

/**
 * Aggregates all successful results from the provided iterable into a single `Result` containing an array of values.
 * If any result is an error, it returns that error without processing further elements.
 *
 * @typeParam TValue - The type of the values contained in the results.
 * @typeParam TError - The type of the error, defaulting to `AppError`.
 * @param source - An iterable of `Result` objects to process.
 * @returns A `Result` containing an array of successful values or the first encountered error.
 * @example
 * ```ts
 * const data = [Ok(1), Ok(2), Err(new AppError("Fail"))];
 * const result = collectAllLazy(data); // Returns Err(AppError("Fail"))
 * ```
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
      return Err(r.error);
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly TValue[]);
};
