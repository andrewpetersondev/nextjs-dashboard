// src/shared/core/result/result-async.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Options for mapping errors in async try/catch operations.
 *
 * @typeParam TError - The custom error type, must extend ErrorLike.
 * @property mapError - Maps an unknown error to the custom error type.
 */
interface TryCatchAsyncMapped<TError extends ErrorLike> {
  readonly mapError: (e: unknown) => TError;
}

/**
 * An asynchronous thunk function that, when invoked, returns a Promise resolving to a value of type `TValue`.
 *
 * @typeParam TValue - The resolved value type of the asynchronous operation.
 * @returns Promise<TValue> - A promise that resolves with a value of type `TValue`.
 */
export type AsyncThunk<TValue> = () => Promise<TValue>;

/**
 * Execute an async function and wrap its outcome as a Result.
 * When no mapper is provided, unknown errors are normalized to AppError.
 * @template TValue Success value type.
 * @param fn Async thunk producing a value.
 * @returns Promise resolving to Result<TValue,AppError>
 */
export function tryCatchAsync<TValue>(
  fn: AsyncThunk<TValue>,
): Promise<Result<TValue, AppError>>;
/**
 * Execute an async function with custom error mapping.
 * @template TValue Success value type.
 * @template TError Custom error type.
 * @param fn Async thunk producing a value.
 * @param options Error mapping options.
 * @returns Promise resolving to Result<TValue,TError>
 */
export function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncThunk<TValue>,
  options: TryCatchAsyncMapped<TError>,
): Promise<Result<TValue, TError>>;
export async function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncThunk<TValue>,
  options?: TryCatchAsyncMapped<TError>,
): Promise<Result<TValue, AppError | TError>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return options ? Err(options.mapError(e)) : Err(normalizeUnknownError(e));
  }
}

// Generic adapter: preserves TError
export async function fromPromise<TValue, TError extends ErrorLike>(
  fn: () => Promise<TValue>,
  mapError: (e: unknown) => TError,
): Promise<Result<TValue, TError>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Convert a Result into a Promise, rejecting on Err branch.
 * @template TValue Success value type.
 * @template TError Error type.
 * @param r Result to unwrap.
 * @returns Promise resolving with the success value or rejecting with the error.
 */
export const toPromise = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): Promise<TValue> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);
