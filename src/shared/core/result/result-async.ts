// File: src/shared/core/result/result-async.ts
import {
  type AppError,
  type ErrorLike,
  normalizeUnknownError,
} from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

interface TryAsyncMapped<TError extends ErrorLike> {
  readonly mapError: (e: unknown) => TError;
}

export type AsyncFn<TValue> = () => Promise<TValue>;

/**
 * Execute an async function and wrap its outcome.
 * @template TValue
 * @template TError
 * @param fn Async thunk producing value.
 * @param options Optional mapper (required for custom error type).
 * @returns Promise of Result.
 */
export function tryCatchAsync<TValue>(
  fn: AsyncFn<TValue>,
): Promise<Result<TValue, AppError>>;
export function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncFn<TValue>,
  options: TryAsyncMapped<TError>,
): Promise<Result<TValue, TError>>;
export async function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncFn<TValue>,
  options?: TryAsyncMapped<TError>,
): Promise<Result<TValue, AppError | TError>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return options ? Err(options.mapError(e)) : Err(normalizeUnknownError(e));
  }
}

/**
 * Wrap a Promise value (forwarding to tryCatchAsync).
 * @template TValue
 * @template TError
 * @param promise Promise producing value.
 * @param mapError Optional error mapper.
 * @returns Promise<Result<TValue,TError>>
 */
export function fromPromise<TValue>(
  promise: Promise<TValue>,
): Promise<Result<TValue, AppError>>;
export function fromPromise<TValue, TError extends ErrorLike>(
  promise: Promise<TValue>,
  mapError: (e: unknown) => TError,
): Promise<Result<TValue, TError>>;
export function fromPromise<TValue, TError extends ErrorLike>(
  promise: Promise<TValue>,
  mapError?: (e: unknown) => TError,
): Promise<Result<TValue, AppError | TError>> {
  return mapError
    ? tryCatchAsync(() => promise, { mapError })
    : tryCatchAsync(() => promise);
}

/**
 * Convert a Result into a Promise, rejecting on Err.
 * @template TValue
 * @template TError
 * @param r Result to unwrap.
 * @returns Promise resolving with value or rejecting with error.
 * @throws TError
 */
export const toPromise = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): Promise<TValue> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);
