import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Execute a synchronous function and wrap its outcome in a Result.
 * If `fn` returns, yields Ok(value). If it throws, yields Err(mapped error or cast).
 * @template T Success type.
 * @template TError Error type (must be Error-like); defaults to Error.
 * @param fn Synchronous thunk to execute.
 * @param mapError Optional mapper to normalize unknown thrown values.
 * @returns Result<T, TError>
 */
export const tryCatch = <T, TError extends Error | { message: string } = Error>(
  fn: () => T,
  mapError?: (e: unknown) => TError,
): Result<T, TError> => {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as TError));
  }
};

/**
 * Wrap a possibly null/undefined value in a Result.
 * Returns Ok(v) when defined; otherwise Err(onNull()).
 * @template T Success type.
 * @template TError Error type.
 * @param v Value that may be nullish.
 * @param onNull Factory producing error when `v` is null/undefined.
 * @returns Result<T, TError>
 */
export const fromNullable = <T, TError extends Error | { message: string }>(
  v: T | null | undefined,
  onNull: () => TError,
): Result<T, TError> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Produce a Result from a predicate applied to a value.
 * Returns Ok(value) if predicate(value) is true; otherwise Err(onFail(value)).
 * @template T Value type.
 * @template TError Error type.
 * @param value Value to test.
 * @param predicate Truth test.
 * @param onFail Error factory when predicate fails.
 * @returns Result<T, TError>
 */
export const fromPredicate = <T, TError extends Error | { message: string }>(
  value: T,
  predicate: (v: T) => boolean,
  onFail: (v: T) => TError,
): Result<T, TError> => (predicate(value) ? Ok(value) : Err(onFail(value)));
