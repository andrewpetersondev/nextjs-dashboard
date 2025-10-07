// src/shared/core/result/result-async.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

interface TryCatchAsyncMapped<TError extends ErrorLike> {
  readonly mapError: (e: unknown) => TError;
}

/**
 * Async thunk producing a value.
 * @template TValue
 */
export type AsyncFn<TValue> = () => Promise<TValue>;

/**
 * Execute an async function and wrap its outcome as a Result.
 * When no mapper is provided, unknown errors are normalized to AppError.
 * @template TValue Success value type.
 * @param fn Async thunk producing a value.
 * @returns Promise resolving to Result<TValue,AppError>
 */
export function tryCatchAsync<TValue>(
  fn: AsyncFn<TValue>,
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
  fn: AsyncFn<TValue>,
  options: TryCatchAsyncMapped<TError>,
): Promise<Result<TValue, TError>>;
export async function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncFn<TValue>,
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
