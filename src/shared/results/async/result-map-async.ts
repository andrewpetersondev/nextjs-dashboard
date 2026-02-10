import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Async maps successful Result to new value.
 *
 * @typeParam TValue - Original value type.
 * @typeParam TNextValue - Transformed value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to transform value.
 * @returns A function that accepts a Result and returns a Promise resolving to transformed Result or original error.
 * @example
 * const mapper = mapOkAsync(async (v: number) => v * 2);
 * const res = await mapper(Ok(10)); // Ok(20)
 */
export function mapOkAsync<TValue, TNextValue, TError extends AppError>(
  fn: (v: TValue) => Promise<TNextValue>,
): (r: Result<TValue, TError>) => Promise<Result<TNextValue, TError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError>> =>
    r.ok ? fn(r.value).then(Ok) : Promise.resolve(r);
}

/**
 * Safely transforms Result value asynchronously, mapping thrown errors.
 *
 * @typeParam TValue - Input value type.
 * @typeParam TNextValue - Output value type.
 * @typeParam TError - Original error type.
 * @typeParam TSideError - Side error type from transformation.
 * @param fn - Async function to transform value.
 * @param mapError - Maps exceptions during execution.
 * @returns A function that accepts a Result and returns a Promise resolving to new Result with transformed value or error.
 * @example
 * const mapper = mapOkAsyncSafe(
 *   async (v: number) => { throw new Error('fail'); },
 *   (e) => makeUnexpectedError(e, { message: 'Mapping failed' })
 * );
 * const res = await mapper(Ok(10)); // Err(AppError)
 */
export function mapOkAsyncSafe<
  TValue,
  TNextValue,
  TError extends AppError,
  TSideError extends AppError,
>(
  fn: (v: TValue) => Promise<TNextValue>,
  mapError: (e: unknown) => TSideError,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TNextValue, TError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError | TSideError>> => {
    if (!r.ok) {
      return r;
    }
    try {
      return Ok(await fn(r.value));
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Maps error in async Result with transformation function.
 *
 * @typeParam TValue - Success value type.
 * @typeParam TError - Original error type.
 * @typeParam TNextError - Transformed error type.
 * @param fn - Transforms original error to new error asynchronously.
 * @returns A function that accepts a Result and returns a Promise resolving to transformed error or original value.
 * @example
 * const mapper = mapErrorAsync(
 *   async (e: AppError) => ({ ...e, message: 'Updated' } as AppError)
 * );
 * const res = await mapper(Err({ code: 'ERR', message: 'Old' } as AppError)); // Err({ code: 'ERR', message: 'Updated' })
 */
export function mapErrorAsync<
  TValue,
  TError extends AppError,
  TNextError extends AppError,
>(
  fn: (e: TError) => Promise<TNextError>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TNextError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TNextError>> =>
    r.ok ? Promise.resolve(r) : fn(r.error).then(Err);
}

/**
 * Safely transforms errors asynchronously, handling unexpected errors.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Initial error type extending AppError.
 * @typeParam TNextError - Transformed error type extending AppError.
 * @typeParam TSideError - Side-error type from mapError function.
 * @param fn - Async function mapping TError to TNextError.
 * @param mapError - Handles unexpected errors.
 * @returns A function that accepts a Result and returns a Promise resolving to Result with transformed error or value.
 * @example
 * const mapper = mapErrorAsyncSafe(
 *   async (e: AppError) => { throw new Error('fail'); },
 *   (err) => makeUnexpectedError(err, { message: 'Error mapping failed' })
 * );
 * const res = await mapper(Err(someError)); // Err(AppError)
 */
export function mapErrorAsyncSafe<
  TValue,
  TError extends AppError,
  TNextError extends AppError,
  TSideError extends AppError,
>(
  fn: (e: TError) => Promise<TNextError>,
  mapError: (e: unknown) => TSideError,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TValue, TNextError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TNextError | TSideError>> => {
    if (r.ok) {
      return r;
    }
    try {
      const next = await fn(r.error);
      return Err(next);
    } catch (e) {
      return Err(mapError(e));
    }
  };
}
