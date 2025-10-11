// File: src/shared/core/result/async/result-async.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * @public
 * Interface for handling asynchronous operations with customizable error mapping.
 *
 * @typeParam TError - The type of error to map to, extending `ErrorLike`.
 * @property mapError - A readonly function to map unknown errors to a specific error type.
 * @example
 * const handler: TryCatchAsyncMapped<CustomError> = { mapError: (e) => new CustomError(e) };
 */
interface TryCatchAsyncMapped<TError extends ErrorLike> {
  readonly mapError: (e: unknown) => TError;
}

/**
 * @public
 * Represents an asynchronous thunk function that returns a promise resolving to a specified value type.
 *
 * @typeParam TValue - The type of the value the promise resolves to.
 * @example
 * ```ts
 * const fetchData: AsyncThunk<string> = async () => "Hello, World!";
 * ```
 */
export type AsyncThunk<TValue> = () => Promise<TValue>;

/**
 * Executes an asynchronous function and wraps the result in a `Result` object, handling errors gracefully.
 *
 * @param fn - The asynchronous function to execute.
 * @returns A promise that resolves with a `Result` object containing either the value or an `AppError`.
 */
export function tryCatchAsync<TValue>(
  fn: AsyncThunk<TValue>,
): Promise<Result<TValue, AppError>>;

/**
 * Executes an asynchronous function and maps errors using provided options.
 *
 * @param fn - The asynchronous function to execute.
 * @param options - Configuration for mapping and handling caught errors.
 * @returns A promise resolving to a `Result` with either the value or mapped error.
 */
export function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncThunk<TValue>,
  options: TryCatchAsyncMapped<TError>,
): Promise<Result<TValue, TError>>;

/**
 * Executes an asynchronous function and wraps the result in a Result object.
 *
 * @typeParam TValue - The type of the value returned on success.
 * @typeParam TError - The type of the error, extending ErrorLike.
 * @param fn - The asynchronous function to execute.
 * @param options - Optional configuration to map errors.
 * @returns A Promise resolving to a Result object with either a success value or an error.
 */
export async function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncThunk<TValue>,
  options?: TryCatchAsyncMapped<TError>,
): Promise<Result<TValue, AppError | TError>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return options ? Err(options.mapError(e)) : Err(toAppErrorFromUnknown(e));
  }
}

/**
 * Executes a promise-returning function and maps errors to a custom error type.
 *
 * @param fn - A thunk that returns a promise resolving to a value of type `TValue`.
 * @param mapError - A function to map any thrown error to a `TError` type.
 * @returns A `Promise` resolving to either `Ok<TValue>` or `Err<TError>`.
 */
export async function fromPromiseThunk<TValue, TError extends ErrorLike>(
  fn: () => Promise<TValue>,
  mapError: (e: unknown) => TError,
): Promise<Result<TValue, TError>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

export const fromAsyncThunk = /* @__PURE__ */ <
  TValue,
  TError extends ErrorLike,
>(
  fn: () => Promise<TValue>,
  mapError: (e: unknown) => TError,
): Promise<Result<TValue, TError>> => fromPromiseThunk(fn, mapError);

/**
 * Converts a promise into a `Result` object, mapping any error to a custom error type.
 *
 * @typeParam TValue - The type of the resolved value of the promise.
 * @typeParam TError - The type of the mapped error, extending `ErrorLike`.
 * @param p - The promise to be converted to a `Result`.
 * @param mapError - A function that maps unknown errors to a `TError`.
 * @returns A `Result` containing either the resolved value or the mapped error.
 */
export async function fromPromise<TValue, TError extends ErrorLike>(
  p: Promise<TValue>,
  mapError: (e: unknown) => TError,
): Promise<Result<TValue, TError>> {
  try {
    return Ok(await p);
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Converts a `Result` to a `Promise`. Resolves with the value if the result is ok,
 * otherwise rejects with the error.
 *
 * @typeParam TValue - The type of the success value contained in the Result.
 * @typeParam TError - The type of the error, extending ErrorLike.
 * @param r - The Result to be transformed into a Promise.
 * @returns A Promise that resolves to `TValue` or rejects with `TError`.
 * @throws Throws the error if the result is not ok.
 */
export const toPromiseOrThrow = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): Promise<TValue> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);
