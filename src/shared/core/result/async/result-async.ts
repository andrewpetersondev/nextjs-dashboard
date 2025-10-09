// File: src/shared/core/result/async/result-async.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Options for mapping errors in asynchronous try/catch operations.
 *
 * @typeParam TError - The custom error type, which must extend ErrorLike.
 * @property mapError - Function that maps an unknown error to the custom error type.
 */
interface TryCatchAsyncMapped<TError extends ErrorLike> {
  readonly mapError: (e: unknown) => TError;
}

/**
 * An asynchronous thunk function that returns a Promise resolving to a value of type `TValue`.
 *
 * @typeParam TValue - The type of the value produced by the asynchronous operation.
 * @returns A Promise that resolves with a value of type `TValue`.
 */
export type AsyncThunk<TValue> = () => Promise<TValue>;

/**
 * Executes an asynchronous function and wraps its result in a Result.
 * If no error mapping options are provided, unknown errors are normalized to AppError.
 *
 * @typeParam TValue - The type of the success value.
 * @param fn - The asynchronous thunk to execute.
 * @returns A Promise resolving to a Result containing either the value or an AppError.
 */
export function tryCatchAsync<TValue>(
  fn: AsyncThunk<TValue>,
): Promise<Result<TValue, AppError>>;

/**
 * Executes an asynchronous function and wraps its result in a Result, using a custom error mapper.
 *
 * @typeParam TValue - The type of the success value.
 * @typeParam TError - The custom error type, which must extend ErrorLike.
 * @param fn - The asynchronous thunk to execute.
 * @param options - Error mapping options.
 * @returns A Promise resolving to a Result containing either the value or the mapped error.
 */
export function tryCatchAsync<TValue, TError extends ErrorLike>(
  fn: AsyncThunk<TValue>,
  options: TryCatchAsyncMapped<TError>,
): Promise<Result<TValue, TError>>;

/**
 * Implementation for tryCatchAsync overloads.
 *
 * @typeParam TValue - The type of the success value.
 * @typeParam TError - The custom error type, which must extend ErrorLike.
 * @param fn - The asynchronous thunk to execute.
 * @param options - Optional error mapping options.
 * @returns A Promise resolving to a Result containing either the value or an error.
 */
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

// TODO: tryCatch/tryCatchAsync error model coupling
// TODO: Defaults map to AppError, but other helpers are generic over ErrorLike.
// TODO: Ensure consistent adapter use across layers to avoid accidental AppError leakage in lower layers.

// TODO: Narrow overloads vs implementation types
// TODO: tryCatch/tryCatchAsync overloads return Result<T, AppError> or Result<T, TError>,
// TODO: but the implementation widens to AppError | TError. This is correct, yet easy to misuse if consumers
// TODO: expect only TError. Keep overloads but ensure call sites don’t double-wrap or mis-assume exclusivity.

/**
 * Executes a Promise-returning function and maps any thrown error to a custom error type.
 *
 * @typeParam TValue - The type of the success value.
 * @typeParam TError - The custom error type, which must extend ErrorLike.
 * @param fn - The function returning a Promise to execute.
 * @param mapError - Function to map unknown errors to the custom error type.
 * @returns A Promise resolving to a Result containing either the value or the mapped error.
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

/**
 * Converts a Result into a Promise, resolving with the value if successful, or rejecting with the error.
 *
 * @typeParam TValue - The type of the success value.
 * @typeParam TError - The error type, which must extend ErrorLike.
 * @param r - The Result to convert.
 * @returns A Promise that resolves with the value or rejects with the error.
 */
export const toPromise = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): Promise<TValue> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);

// TODO: toPromise breaks Result discipline
// TODO: It rejects on Err, turning controlled Result flow back into exceptions.
// TODO: This is useful for interop, but easy to misuse.
// TODO: Consider naming it toPromiseOrThrow and documenting clearly that it throws in the Err path.
