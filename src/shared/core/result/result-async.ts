import { Err, Ok, type Result } from "@/shared/core/result/result";

export type AsyncFn<T> = () => Promise<T>;

export interface TryAsyncOptions<TError> {
  readonly mapError?: (e: unknown) => TError;
}

/**
 * Execute an async thunk and wrap outcome in a Result.
 * @template T Success type.
 * @template TError Constrained error type (Error-like); defaults to Error.
 * @param fn Async function producing a value.
 * @param options Optional mapError to normalize unknown failures.
 */
export const tryCatchAsync = async <
  T,
  TError extends Error | { message: string } = Error,
>(
  fn: AsyncFn<T>,
  options?: TryAsyncOptions<TError>,
): Promise<Result<T, TError>> => {
  try {
    const value = await fn();
    return Ok<T, TError>(value);
  } catch (e: unknown) {
    const mapped = options?.mapError ? options.mapError(e) : (e as TError);
    return Err<T, TError>(mapped);
  }
};

/**
 * Wrap an existing Promise into a Result.
 * @template T Success type.
 * @template TError Error type (Error-like).
 * @param promise The promise to observe.
 * @param mapError Optional mapper for rejection reason.
 */
export const fromPromise = async <
  T,
  TError extends Error | { message: string } = Error,
>(
  promise: Promise<T>,
  mapError?: (e: unknown) => TError,
): Promise<Result<T, TError>> => {
  try {
    return Ok(await promise);
  } catch (e: unknown) {
    return Err(mapError ? mapError(e) : (e as TError));
  }
};

/**
 * Convert a Result to a Promise, rejecting with the error on Err.
 * @template T Success type.
 * @template TError Error type.
 */
export const toPromise = <T, TError>(r: Result<T, TError>): Promise<T> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);

/**
 * @deprecated Use tryCatchAsync(fn, { mapError }) instead.
 */
export const fromPromiseFn = <
  T,
  TError extends Error | { message: string } = Error,
>(
  fn: AsyncFn<T>,
  mapError?: (e: unknown) => TError,
): Promise<Result<T, TError>> =>
  tryCatchAsync(fn, mapError ? { mapError } : undefined);
