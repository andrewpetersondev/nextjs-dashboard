// File: src/shared/core/result/iter/result-collect-iter.ts

import type { AppError } from "@/shared/result/app-error/app-error";
import { Err, Ok, type Result } from "@/shared/result/result";

/**
 * Iterates over the source, yielding values from successful results until an error result is encountered.
 *
 * @param source - An iterable of `Result` objects to process.
 * @typeParam Tvalue - The type of successful values in the result.
 * @typeParam Terror - The type of error to handle, extending `AppError`.
 * @returns A generator that yields successful values, or an error result if one is encountered.
 */
export function* iterateOk<Tvalue, Terror extends AppError>(
  source: Iterable<Result<Tvalue, Terror>>,
): Generator<Tvalue, Result<void, Terror>, unknown> {
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
 * @typeParam Tvalue - The type of the values contained in the results.
 * @typeParam Terror - The type of the error.
 * @param source - An iterable of `Result` objects to process.
 * @returns A `Result` containing an array of successful values or the first encountered error.
 */
export const collectAllLazy = /* @__PURE__ */ <Tvalue, Terror extends AppError>(
  source: Iterable<Result<Tvalue, Terror>>,
): Result<readonly Tvalue[], Terror> => {
  const acc: Tvalue[] = [];
  for (const r of source) {
    if (!r.ok) {
      return Err(r.error);
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly Tvalue[]);
};
