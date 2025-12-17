import type { AppError } from "@/shared/errors/core/app-error";
import { Err, Ok } from "@/shared/result/result";
import type { AsyncThunk, Result } from "@/shared/result/result.types";

/**
 * Executes an async function and wraps the result.
 *
 * @typeParam T - Success value type.
 * @typeParam E - Error type extending AppError.
 * @param fn - Async function to execute.
 * @param mapError - Maps unknown errors to error type.
 * @returns Promise resolving to Result with value or error.
 */
export async function tryCatchAsync<T, E extends AppError>(
  fn: AsyncThunk<T>,
  mapError: (e: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Executes a promise-returning function and maps errors.
 *
 * @param fn - Thunk returning promise resolving to value.
 * @param mapError - Maps thrown errors to custom type.
 * @returns Promise resolving to Ok or Err.
 */
export async function fromPromiseThunk<T, E extends AppError>(
  fn: () => Promise<T>,
  mapError: (e: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

export const fromAsyncThunk = /* @__PURE__ */ <T, E extends AppError>(
  fn: () => Promise<T>,
  mapError: (e: unknown) => E,
): Promise<Result<T, E>> => fromPromiseThunk(fn, mapError);

/**
 * Converts a promise into a Result, mapping errors.
 *
 * @typeParam T - Resolved value type.
 * @typeParam E - Mapped error type extending AppError.
 * @param p - Promise to convert.
 * @param mapError - Maps unknown errors to custom type.
 * @returns Result with resolved value or mapped error.
 */
export async function fromPromise<T, E extends AppError>(
  p: Promise<T>,
  mapError: (e: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return Ok(await p);
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Converts Result to Promise. Resolves with value if ok, rejects with error otherwise.
 *
 * @typeParam T - Success value type.
 * @typeParam E - Error type extending AppError.
 * @param r - Result to transform.
 * @returns Promise resolving to value or rejecting with error.
 * @throws Throws error if result is not ok.
 */
export const toPromiseOrThrow = <T, E extends AppError>(
  r: Result<T, E>,
): Promise<T> => (r.ok ? Promise.resolve(r.value) : Promise.reject(r.error));
