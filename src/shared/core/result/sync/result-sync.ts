// File: src/shared/core/result/sync/result-sync.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Executes a function and captures any thrown errors as an `AppError`.
 *
 * @param fn - The function to execute safely.
 * @returns A `Result` containing either the function's return value or an `AppError`.
 * @see AppError, Result
 * @example `const result = tryCatch(() => riskyOperation());`
 */
export function tryCatch<TValue>(fn: () => TValue): Result<TValue, AppError>;

/**
 * Executes a function and maps any thrown error to a specified error type.
 *
 * @typeParam TValue - The type of the value returned by the function.
 * @typeParam TError - The type of the mapped error.
 * @param fn - A function to be executed safely.
 * @param mapError - A function to map the caught error to the specified error type.
 * @returns A `Result` containing the function's return value or the mapped error.
 */
export function tryCatch<TValue, TError extends ErrorLike>(
  fn: () => TValue,
  mapError: (e: unknown) => TError,
): Result<TValue, TError>;

/**
 * Executes a function and captures any errors, optionally mapping them to a custom type.
 *
 * @typeParam TValue - The type of the return value of the function.
 * @typeParam TError - The type of the custom error.
 * @param fn - The function to execute within a try-catch block.
 * @param mapError - An optional function to map unknown errors to a custom error type.
 * @returns A `Result` object containing the successful value or an error.
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

// TODO: tryCatch/tryCatchAsync error model coupling
// TODO: Defaults map to AppError, but other helpers are generic over ErrorLike.
// TODO: Ensure consistent adapter use across layers to avoid accidental AppError leakage in lower layers.

// TODO: Narrow overloads vs implementation types
// TODO: tryCatch/tryCatchAsync overloads return Result<T, AppError> or Result<T, TError>,
// TODO: but the implementation widens to AppError | TError. This is correct, yet easy to misuse if consumers
// TODO: expect only TError. Keep overloads but ensure call sites don’t double-wrap or mis-assume exclusivity.

/**
 * Converts a nullable value into a `Result`.
 * If the value is `null` or `undefined`, an error is returned.
 *
 * @typeParam TValue - The type of the input value.
 * @typeParam TError - The type of the error to return (defaults to `AppError`).
 * @param v - The nullable value to evaluate.
 * @param onNull - A callback function returning the error when the value is null or undefined.
 * @returns A `Result` wrapping the value or the generated error.
 * @example
 * const result = fromNullable(value, () => new AppError("Value is null"));
 */
export const fromNullable = <TValue, TError extends ErrorLike = AppError>(
  v: TValue | null | undefined,
  onNull: () => TError,
): Result<TValue, TError> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Creates a `Result` object based on the evaluation of a predicate.
 *
 * @typeParam TValue - The type of the input value.
 * @typeParam TError - The type of the error to return, extending `ErrorLike`.
 * @param value - The input value to evaluate.
 * @param predicate - The function to test the input value.
 * @param onFail - A function invoked to generate an error when the predicate fails.
 * @returns A `Result` containing the value if the predicate passes, otherwise an error.
 */
export const fromPredicate = <TValue, TError extends ErrorLike = AppError>(
  value: TValue,
  predicate: (v: TValue) => boolean,
  onFail: (v: TValue) => TError,
): Result<TValue, TError> =>
  predicate(value) ? Ok(value) : Err(onFail(value));
