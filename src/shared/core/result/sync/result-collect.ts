// File: src/shared/core/result/sync/result-collect.ts

import type { ErrorLike } from "@/shared/core/result/app-error/app-error";
import {
  Err,
  type ErrType,
  Ok,
  type OkType,
  type Result,
} from "@/shared/core/result/result";

/**
 * Collects all successful results from the provided array, returning a combined `Result`.
 *
 * @typeParam TValue - The type of the successful value in the `Result`.
 * @typeParam TError - The type of the error.
 * @param results - An array of `Result` objects to process.
 * @returns A `Result` containing an array of all successful values or the first encountered error.
 */
export const collectAll = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  results: readonly Result<TValue, TError>[],
): Result<readonly TValue[], TError> => {
  const acc: TValue[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly TValue[]);
};

/**
 * Gathers a tuple of `Result` values into a single `Result`, returning all `Ok` values
 * if successful or the first encountered `Error` otherwise.
 *
 * @typeParam TError - The type of error used in the `Result`.
 * @typeParam TTuple - The tuple of `Result` objects to process.
 * @param results - A variadic list of `Result` objects to combine.
 * @returns A `Result` containing an array of all `Ok` values or the first `Error`.
 * @example
 * ```ts
 * const res = collectTuple(Ok(1), Ok(2), Err(new Error("Failure")));
 * // Output: Err<Error>
 * ```
 */
export function collectTuple<
  TError extends ErrorLike,
  TTuple extends readonly Result<unknown, TError>[],
>(
  ...results: TTuple
): Result<{ readonly [K in keyof TTuple]: OkType<TTuple[K]> }, TError> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof TTuple]: OkType<TTuple[K]> },
        TError
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof TTuple]: OkType<TTuple[K]> });
}

/**
 * Processes an array of heterogeneous `Result` objects and groups their successes or returns the first error encountered.
 *
 * @param results - A variadic array of `Result` objects to process.
 * @returns A `Result` containing either an array of all successful values or the first occurred error.
 */
export function collectTupleHetero<
  TTuple extends readonly Result<unknown, ErrorLike>[],
>(
  ...results: TTuple
): Result<
  { readonly [K in keyof TTuple]: OkType<TTuple[K]> },
  ErrType<TTuple[number]>
> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof TTuple]: OkType<TTuple[K]> },
        ErrType<TTuple[number]>
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof TTuple]: OkType<TTuple[K]> });
}

/**
 * Returns the first successful `Result` in the provided array, or an error result
 * created using `onEmpty` if none are successful.
 *
 * @typeParam TValue - The type of the value in a successful `Result`.
 * @typeParam TError - The type of the error in a failed `Result`.
 * @param onEmpty - A callback function that produces a fallback error when no successful result is found.
 * @returns The first `Result` with `ok: true`, or a fallback error `Result`.
 */
export const firstOkOrElse =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(onEmpty: () => TError) =>
    /* @__PURE__ */
    (results: readonly Result<TValue, TError>[]): Result<TValue, TError> => {
      let lastErr: Result<never, TError> | null = null;
      for (const r of results) {
        if (r.ok) {
          return r;
        }
        lastErr = r as Result<never, TError>;
      }
      return lastErr ?? Err(onEmpty());
    };
