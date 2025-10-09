// File: src/shared/core/result/sync/result-tap.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Executes a provided function if the `Result` is successful (`ok`), passing its value.
 * Returns the original `Result` regardless of its state.
 *
 * @public
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the error in the result, extending `ErrorLike`.
 * @param fn - The function to execute if the result is successful.
 * @returns The original `Result` instance.
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
 * Applies a side-effect function to the error of a `Result` if it is not ok.
 *
 * @typeParam TValue - The type of the success value.
 * @typeParam TError - The type of the error, extending `ErrorLike`.
 * @param fn - A function to handle the error.
 * @returns The original `Result` after applying the side-effect.
 * @example
 * const result = tapError(error => console.log(error))(someResult);
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
 * Safely applies a given function to the success value of a Result.
 *
 * @param fn - A callback function to process the success value.
 * @returns A function that operates on a Result and preserves its type while handling potential errors.
 */
export function tapOkSafe<TValue, TError extends ErrorLike>(
  fn: (v: TValue) => void,
): (r: Result<TValue, TError>) => Result<TValue, TError | AppError>;

/**
 * Applies a side-effect operation to the successful value of a `Result`, while safely mapping errors if any occur.
 *
 * @param fn - Function to execute on the successful value.
 * @param mapError - Function to transform unknown errors into a `TSideError`.
 * @returns A function that takes a `Result` and applies the side effect safely.
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
 * A function to safely process a `Result` value and handle side effects.
 *
 * @param fn - Function called with the successful value of the `Result`.
 * @param mapError - Optional mapping function to transform errors, defaults to `toAppErrorFromUnknown`.
 * @returns A transformed `Result` preserving the original or including the side-effect error.
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
 * Safely taps into the error of a `Result` object, applying a function to it and handling potential exceptions.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the error, extends `ErrorLike`.
 * @param fn - Callback function to process the error.
 * @returns A new `Result` containing the original value or a transformed error.
 */
export function tapErrorSafe<TValue, TError extends ErrorLike>(
  fn: (e: TError) => void,
): (r: Result<TValue, TError>) => Result<TValue, TError | AppError>;

/**
 * Safely taps into the error of a `Result`, applying a function and transforming unknown errors.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the primary error.
 * @typeParam TSideError - The type of the transformed side error.
 * @param fn - A function to process the error of type `TError`.
 * @param mapError - A function to transform unknown errors to `TSideError`.
 * @returns A function that takes a `Result` and returns a `Result` with transformed errors if applicable.
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
 * Safely executes a function on an error and optionally maps unknown errors to a specific type.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the primary error in the result.
 * @typeParam TSideError - The type of the fallback error, defaults to `AppError`.
 * @param fn - A function to handle the primary error.
 * @param mapError - An optional function to map unknown errors to `TSideError`.
 * @returns A wrapped Result, potentially transformed with a side error if mapping occurs.
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
