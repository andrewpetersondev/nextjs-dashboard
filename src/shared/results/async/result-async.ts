import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Executes an async function and wraps the result.
 *
 * @typeParam TValue - Success value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to execute.
 * @param mapError - Maps unknown errors to error type.
 * @returns Promise resolving to Result with value or error.
 * @example
 * const res = await tryCatchAsync(
 *   async () => await fetchData(),
 *   (e) => ({ code: 'FETCH_ERROR', message: String(e) })
 * );
 */
export async function tryCatchAsync<TValue, TError extends AppError>(
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
 * Converts Result to Promise. Resolves with value if ok, rejects with error otherwise.
 *
 * @typeParam TValue - Success value type.
 * @typeParam TError - Error type extending AppError.
 * @param r - Result to transform.
 * @returns Promise resolving to value or rejecting with error.
 * @throws Throws error if result is not ok.
 * @example
 * const value = await toPromiseOrThrow(Ok(42)); // 42
 */
export function toPromiseOrThrow<TValue, TError extends AppError>(
  r: Result<TValue, TError>,
): Promise<TValue> {
  if (r.ok) {
    return Promise.resolve(r.value);
  }

  // Ensure rejection with an Error instance (AppError extends Error)
  return Promise.reject(
    r.error instanceof Error ? r.error : new Error(String(r.error)),
  );
}
