// File: src/shared/core/result/sync/result-sync.ts
// Purpose: Adapter-first sync builders (no default AppError).

import type { AppError } from "@/shared/core/result/app-error/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Executes a function and catches any thrown errors, mapping them to a specified error type.
 *
 * @typeParam TValue - The type of the value returned by the function.
 * @typeParam TError - The type of the error returned by the mapping function.
 * @param fn - The function to execute.
 * @param mapError - A callback to convert thrown errors into a specific error type.
 * @returns A `Result` object containing either the value or the mapped error.
 */
export function tryCatch<TValue, TError extends AppError>(
  fn: () => TValue,
  mapError: (e: unknown) => TError,
): Result<TValue, TError> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Creates a `Result` object from a potentially nullable value.
 *
 * @typeParam TValue - The type of the expected value.
 * @typeParam TError - The type of error to return, extending `AppError`.
 * @param v - The value which may be `null` or `undefined`.
 * @param onNull - A callback that returns an error when the value is `null` or `undefined`.
 * @returns A `Result` containing a value if `v` is non-null, otherwise an error.
 * @example
 * const result = fromNullable(value, () => new AppError('Value is null or undefined'));
 */
export const fromNullable = <TValue, TError extends AppError>(
  v: TValue | null | undefined,
  onNull: () => TError,
): Result<TValue, TError> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Creates a `Result` based on the evaluation of a predicate function.
 *
 * @typeParam TValue - The type of the input value to evaluate.
 * @typeParam TError - The type of the error to return.
 * @param value - The value to be checked against the predicate.
 * @param predicate - A function that returns `true` if the value satisfies a condition.
 * @param onFail - A function that generates an error when the predicate fails.
 * @returns A `Result` containing the value if the predicate passes, or an error otherwise.
 */
export const fromPredicate = <TValue, TError extends AppError>(
  value: TValue,
  predicate: (v: TValue) => boolean,
  onFail: (v: TValue) => TError,
): Result<TValue, TError> =>
  predicate(value) ? Ok(value) : Err(onFail(value));

// Guard-based variant
export const fromGuard = /* @__PURE__ */ <
  TIn,
  TOut extends TIn,
  TError extends AppError,
>(
  value: TIn,
  guard: (v: TIn) => v is TOut,
  onFail: (v: TIn) => TError,
): Result<TOut, TError> => (guard(value) ? Ok(value) : Err(onFail(value)));
