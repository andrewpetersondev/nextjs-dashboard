// File: src/shared/core/result/result-tap-async.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Applies an asynchronous side-effect function to the `value` of a successful `Result` without altering it.
 *
 * @alpha
 * @typeParam TValue - The type of the successful value in the `Result`.
 * @typeParam TError - The type of the error in the `Result`, must extend `ErrorLike`.
 * @param fn - An asynchronous function to execute if the `Result` is successful.
 * @returns A promise resolving to the original `Result`.
 * @example
 * const result = await tapOkAsync(async (value) => console.log(value))(someResult);
 */
export const tapOkAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (v: TValue) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (r.ok) {
        await fn(r.value);
      }
      return r;
    };

/**
 * Asynchronously executes a provided function if the `Result` contains an error.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type extending `ErrorLike` for the error value.
 * @param fn - A function that processes the error and returns a Promise.
 * @returns The original `Result` object after handling the error.
 * @example
 * ```ts
 * const logError = async (err: Error) => { console.error(err.message); };
 * const result = await tapErrorAsync(logError)(someResult);
 * ```
 */
export const tapErrorAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (e: TError) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (!r.ok) {
        await fn(r.error);
      }
      return r;
    };

/**
 * Safely applies an asynchronous operation to a `Result` object and propagates any errors.
 *
 * @typeParam TValue - The type of the value in the `Result`.
 * @typeParam TError - The type of the error in the `Result`, extending `ErrorLike`.
 * @param fn - An asynchronous function that processes the successful value of the `Result`.
 * @returns A function that maps over a `Result` and returns a `Promise` resolving to a new `Result`.
 * @public
 */
export function tapOkAsyncSafe<TValue, TError extends ErrorLike>(
  fn: (v: TValue) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | AppError>>;
/**
 * Executes a side-effect asynchronously on a successful result value in a type-safe manner.
 * Maps errors occurring during the side-effect execution to a specified error type.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The error type of the original result.
 * @typeParam TSideError - The error type for the side-effect error.
 * @param fn - An async function to execute as a side-effect on the successful result value.
 * @param mapError - A function to map thrown errors during side-effect execution to `TSideError`.
 * @returns A function that processes a result and returns a promise resolving to a new result.
 */
export function tapOkAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (v: TValue) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>>;

/**
 * Executes a side-effect asynchronously on a successful result, safely handling errors.
 *
 * @param fn - A function that performs an asynchronous operation using the successful `TValue` of the result.
 * @param mapError - Optional function to map any caught errors to `TSideError`.
 * @returns A `Promise` resolving to the original `Result`, or an error if the side-effect fails.
 * @typeParam TValue - Type of the successful result value.
 * @typeParam TError - Type of the error in the original `Result`.
 * @typeParam TSideError - Type of the error produced by the side-effect (default is `AppError`).
 */
export function tapOkAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (v: TValue) => Promise<void>, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError | AppError>> => {
    if (r.ok) {
      try {
        await fn(r.value);
      } catch (e) {
        const mapped = mapError ? mapError(e) : normalizeUnknownError(e);
        return Err(mapped);
      }
    }
    return r;
  };
}

/**
 * Safely taps into errors in a Result asynchronously, invoking the provided function.
 *
 * @param fn - An asynchronous function that takes the error and performs actions.
 * @returns A function that processes a Result, returning a new Promise with the original or transformed Result.
 */
export function tapErrorAsyncSafe<TValue, TError extends ErrorLike>(
  fn: (e: TError) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | AppError>>;

/**
 * Safely processes an error in an asynchronous context, enabling error mapping.
 *
 * @param fn - A function to process the error of type `TError`.
 * @param mapError - A function to map unknown errors to `TSideError`.
 * @returns A function that takes a `Result` and returns a `Promise` of a mapped `Result`.
 */
export function tapErrorAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (e: TError) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>>;

/**
 * Safely executes an asynchronous function on an error within a `Result`, mapping any failures if necessary.
 *
 * @typeParam TValue - The type of the successful value in the `Result`.
 * @typeParam TError - The type of the expected error in the `Result`.
 * @typeParam TSideError - The type of a possible mapped or secondary error (default is `AppError`).
 * @param fn - An asynchronous function to handle the error.
 * @param mapError - Optional function to map unknown errors to a specific `TSideError` type.
 * @returns A `Promise` resolving to the original `Result`, or a new `Err` with a mapped error.
 */
export function tapErrorAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (e: TError) => Promise<void>, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError | AppError>> => {
    if (!r.ok) {
      try {
        await fn(r.error);
      } catch (e) {
        const mapped = mapError ? mapError(e) : normalizeUnknownError(e);
        return Err(mapped);
      }
    }
    return r;
  };
}
