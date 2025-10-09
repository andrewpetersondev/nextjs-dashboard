// File: src/shared/core/result/sync/result-tap.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Executes a side-effect function if the `Result` is successful (`ok`).
 *
 * @typeParam TValue - The type of the successful `Result` value.
 * @typeParam TError - The type extending `ErrorLike` for the error state.
 * @param fn - A function to execute with the successful `Result` value.
 * @returns The unchanged input `Result`.
 * @example
 * const logValue = (value: number) => console.log(value);
 * const result = tapOk(logValue)({ ok: true, value: 42 });
 */
export const tapOk =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (v: TValue) => void) =>
    (r: Result<TValue, TError>): Result<TValue, TError> => {
      if (r.ok) {
        fn(r.value);
      }
      return r;
    };

/**
 * Invokes the provided callback function if the `Result` object represents an error.
 *
 * @typeParam TValue - The type of the successful value.
 * @typeParam TError - The type of the error, extending `ErrorLike`.
 * @param fn - A callback function executed with the error if the `Result` is not successful.
 * @returns The original `Result` object, unchanged.
 * @example
 * ```ts
 * tapError((error) => console.error(error.message))(result);
 * ```
 */
export const tapError =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (e: TError) => void) =>
    (r: Result<TValue, TError>): Result<TValue, TError> => {
      if (!r.ok) {
        fn(r.error);
      }
      return r;
    };

/**
 * Safely applies the provided function to the success value of a `Result` if it exists.
 *
 * @typeParam TValue - The type of the success value in the `Result`.
 * @typeParam TError - The type of the error value, extending `ErrorLike`.
 * @param fn - A function to be executed with the success value.
 * @returns A function that takes a `Result` and returns the updated `Result` with potential errors wrapped in `AppError`.
 */
export function tapOkSafe<TValue, TError extends ErrorLike>(
  fn: (v: TValue) => void,
): (r: Result<TValue, TError>) => Result<TValue, TError | AppError>;

/**
 * Safely executes a side-effect function if the `Result` is successful, mapping any errors during execution.
 *
 * @param fn - The side-effect function to execute on the success value.
 * @param mapError - A function to transform any thrown error into a `TSideError`.
 * @returns A function that processes a `Result` and applies the side effect if successful.
 */
export function tapOkSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (v: TValue) => void,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Result<TValue, TError | TSideError>;

/**
 * Safely executes a provided function on the value of a successful `Result`,
 * while handling potential side errors.
 *
 * @typeParam TValue - The type of the value in the `Result`.
 * @typeParam TError - The type of the error in the initial `Result`.
 * @typeParam TSideError - The type of the error that might occur during the side-effect (default: `AppError`).
 * @param fn - A callback function to execute if the result is successful.
 * @param mapError - An optional mapping function for handling errors thrown by the callback.
 * @returns A new `Result` with side errors handled safely.
 */
export function tapOkSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (v: TValue) => void, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Result<TValue, TError | TSideError | AppError> => {
    if (r.ok) {
      try {
        fn(r.value);
      } catch (e) {
        const sideErr = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(sideErr);
      }
    }
    return r;
  };
}

/**
 * A utility function that safely handles errors in a `Result` object
 * by applying a provided callback function to the error.
 *
 * @typeParam TValue - The type of the success value in the `Result`.
 * @typeParam TError - The type of the error in the `Result`, extending `ErrorLike`.
 * @param fn - A function to handle the error, receiving it as an argument.
 * @returns A new function that processes a `Result` and returns a transformed `Result`.
 */
export function tapErrorSafe<TValue, TError extends ErrorLike>(
  fn: (e: TError) => void,
): (r: Result<TValue, TError>) => Result<TValue, TError | AppError>;

/**
 * Safely executes a side effect function on an error, mapping unexpected errors to a defined type.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the expected error.
 * @typeParam TSideError - The type of the mapped error for unexpected cases.
 * @param fn - A function to handle the expected error.
 * @param mapError - A function to map unknown errors to a `TSideError`.
 * @returns A function that processes a `Result` and returns it with expected or mapped errors.
 */
export function tapErrorSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (e: TError) => void,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Result<TValue, TError | TSideError>;

/**
 * Safely applies a function to handle errors within a result, catching any additional errors raised during execution.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the primary error in the result.
 * @typeParam TSideError - The type of the error raised by the `fn` or `mapError` (defaults to `AppError`).
 * @param fn - The function to execute when the result contains an error.
 * @param mapError - Optional function to map unknown errors to a specific error type.
 * @returns A function that processes a result and safely invokes the error handler or maps secondary errors.
 */
export function tapErrorSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (e: TError) => void, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Result<TValue, TError | TSideError | AppError> => {
    if (!r.ok) {
      try {
        fn(r.error);
      } catch (e) {
        const sideErr = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(sideErr);
      }
    }
    return r;
  };
}
