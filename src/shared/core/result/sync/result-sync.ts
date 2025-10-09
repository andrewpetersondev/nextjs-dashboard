// File: src/shared/core/result/sync/result-sync.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Executes a function and captures any thrown errors into a result object.
 *
 * @param fn - The function to be executed, which may throw an error.
 * @returns A `Result` object containing the function's return value or an `AppError`.
 * @throws Throws only if unexpected errors occur outside the provided function.
 * @example
 * ```
 * const result = tryCatch(() => JSON.parse(data));
 * if (result.isErr()) { console.error(result.error); }
 * ```
 */
export function tryCatch<TValue>(fn: () => TValue): Result<TValue, AppError>;

/**
 * Executes a function and catches any thrown errors, mapping them to a specified error type.
 *
 * @typeParam TValue - The type of the value returned by the function.
 * @typeParam TError - The type of the error returned by the mapping function.
 * @param fn - The function to execute.
 * @param mapError - A callback to convert thrown errors into a specific error type.
 * @returns A `Result` object containing either the value or the mapped error.
 */
export function tryCatch<TValue, TError extends ErrorLike>(
  fn: () => TValue,
  mapError: (e: unknown) => TError,
): Result<TValue, TError>;

/**
 * Executes a function and catches any errors, mapping them to a custom error type if provided.
 *
 * @typeParam TValue - The return type of the function.
 * @typeParam TError - The custom error type extending `ErrorLike`.
 * @param fn - The function to execute.
 * @param mapError - Optional function to map unknown errors to `TError`.
 * @returns A `Result` object containing either the function result or a mapped error.
 */
export function tryCatch<TValue, TError extends ErrorLike>(
  fn: () => TValue,
  mapError?: (e: unknown) => TError,
): Result<TValue, AppError | TError> {
  try {
    return Ok(fn());
  } catch (e) {
    return mapError ? Err(mapError(e)) : Err(toAppErrorFromUnknown(e));
  }
}

/**
 * Creates a `Result` object from a potentially nullable value.
 *
 * @typeParam TValue - The type of the expected value.
 * @typeParam TError - The type of error to return, extending `ErrorLike`. Defaults to `AppError`.
 * @param v - The value which may be `null` or `undefined`.
 * @param onNull - A callback that returns an error when the value is `null` or `undefined`.
 * @returns A `Result` containing a value if `v` is non-null, otherwise an error.
 * @example
 * const result = fromNullable(value, () => new AppError('Value is null or undefined'));
 */
export const fromNullable = <TValue, TError extends ErrorLike = AppError>(
  v: TValue | null | undefined,
  onNull: () => TError,
): Result<TValue, TError> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Creates a `Result` based on the evaluation of a predicate function.
 *
 * @typeParam TValue - The type of the input value to evaluate.
 * @typeParam TError - The type of the error to return; defaults to `AppError`.
 * @param value - The value to be checked against the predicate.
 * @param predicate - A function that returns `true` if the value satisfies a condition.
 * @param onFail - A function that generates an error when the predicate fails.
 * @returns A `Result` containing the value if the predicate passes, or an error otherwise.
 */
export const fromPredicate = <TValue, TError extends ErrorLike = AppError>(
  value: TValue,
  predicate: (v: TValue) => boolean,
  onFail: (v: TValue) => TError,
): Result<TValue, TError> =>
  predicate(value) ? Ok(value) : Err(onFail(value));

// Guard-based variant
export const fromGuard = /* @__PURE__ */ <
  TIn,
  TOut extends TIn,
  TError extends ErrorLike = AppError,
>(
  value: TIn,
  guard: (v: TIn) => v is TOut,
  onFail: (v: TIn) => TError,
): Result<TOut, TError> => (guard(value) ? Ok(value) : Err(onFail(value)));
