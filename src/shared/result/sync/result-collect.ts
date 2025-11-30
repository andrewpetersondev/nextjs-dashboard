// File: src/shared/core/result/sync/result-collect.ts

import type { AppError } from "@/shared/errors/app-error";
import {
  Err,
  type ErrType,
  Ok,
  type OkType,
  type Result,
} from "@/shared/result/result";

/**
 * Collects all successful results from the provided array, returning a combined `Result`.
 *
 * @typeParam Tvalue - The type of the successful value in the `Result`.
 * @typeParam Terror - The type of the error.
 * @param results - An array of `Result` objects to process.
 * @returns A `Result` containing an array of all successful values or the first encountered error.
 */
export const collectAll = /* @__PURE__ */ <Tvalue, Terror extends AppError>(
  results: readonly Result<Tvalue, Terror>[],
): Result<readonly Tvalue[], Terror> => {
  const acc: Tvalue[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly Tvalue[]);
};

/**
 * Gathers a tuple of `Result` values into a single `Result`, returning all `Ok` values
 * if successful or the first encountered `Error` otherwise.
 *
 * @typeParam Terror - The type of error used in the `Result`.
 * @typeParam Ttuple - The tuple of `Result` objects to process.
 * @param results - A variadic list of `Result` objects to combine.
 * @returns A `Result` containing an array of all `Ok` values or the first `Error`.
 * @example
 * ```ts
 * const res = collectTuple(Ok(1), Ok(2), Err(new Error("Failure")));
 * // Output: Err<Error>
 * ```
 */
export function collectTuple<
  Terror extends AppError,
  Ttuple extends readonly Result<unknown, Terror>[],
>(
  ...results: Ttuple
): Result<{ readonly [K in keyof Ttuple]: OkType<Ttuple[K]> }, Terror> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof Ttuple]: OkType<Ttuple[K]> },
        Terror
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof Ttuple]: OkType<Ttuple[K]> });
}

/**
 * Processes an array of heterogeneous `Result` objects and groups their successes or returns the first error encountered.
 *
 * @param results - A variadic array of `Result` objects to process.
 * @returns A `Result` containing either an array of all successful values or the first occurred error.
 */
export function collectTupleHetero<
  Ttuple extends readonly Result<unknown, AppError>[],
>(
  ...results: Ttuple
): Result<
  { readonly [K in keyof Ttuple]: OkType<Ttuple[K]> },
  ErrType<Ttuple[number]>
> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof Ttuple]: OkType<Ttuple[K]> },
        ErrType<Ttuple[number]>
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof Ttuple]: OkType<Ttuple[K]> });
}

/**
 * Returns the first successful `Result` in the provided array, or an error result
 * created using `onEmpty` if none are successful.
 *
 * @typeParam Tvalue - The type of the value in a successful `Result`.
 * @typeParam Terror - The type of the error in a failed `Result`.
 * @param onEmpty - A callback function that produces a fallback error when no successful result is found.
 * @returns The first `Result` with `ok: true`, or a fallback error `Result`.
 */
export const firstOkOrElse =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(onEmpty: () => Terror) =>
    /* @__PURE__ */
    (results: readonly Result<Tvalue, Terror>[]): Result<Tvalue, Terror> => {
      let lastErr: Result<never, Terror> | null = null;
      for (const r of results) {
        if (r.ok) {
          return r;
        }
        lastErr = r as Result<never, Terror>;
      }
      return lastErr ?? Err(onEmpty());
    };
