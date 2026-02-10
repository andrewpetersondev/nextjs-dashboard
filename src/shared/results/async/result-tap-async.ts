import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Executes async function if Result is successful.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to execute with value.
 * @returns A function that accepts a Result and returns a Promise resolving to same Result.
 * @example
 * const tapper = tapOkAsync(async (v) => console.log(v));
 * const res = await tapper(Ok(42)); // Ok(42)
 */
export function tapOkAsync<TValue, TError extends AppError>(
  fn: (v: TValue) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError>> => {
    if (r.ok) {
      return fn(r.value).then(() => r);
    }
    return Promise.resolve(r);
  };
}

/**
 * Safely executes async operation on Result, mapping thrown errors.
 *
 * @typeParam TValue - Successful value type.
 * @typeParam TError - Original error type.
 * @typeParam TSideError - Mapped side error type.
 * @param fn - Async function to execute if successful.
 * @param mapError - Maps thrown errors to TSideError.
 * @returns A function that accepts a Result and returns a Promise resolving to same Result or wrapping error.
 * @example
 * const tapper = tapOkAsyncSafe(
 *   async (v) => { throw new Error('fail'); },
 *   (e) => makeUnexpectedError(e, { message: 'Tap failed' })
 * );
 * const res = await tapper(Ok(42)); // Err(AppError)
 */
export function tapOkAsyncSafe<
  TValue,
  TError extends AppError,
  TSideError extends AppError,
>(
  fn: (v: TValue) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError>> => {
    if (!r.ok) {
      return r;
    }
    try {
      await fn(r.value);
      return r;
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Handles Result error case asynchronously by executing function.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to process error.
 * @returns A function that accepts a Result and returns a Promise resolving to unchanged Result.
 * @example
 * const tapper = tapErrorAsync(async (e) => console.error(e));
 * const res = await tapper(Err(err)); // Err(err)
 */
export function tapErrorAsync<TValue, TError extends AppError>(
  fn: (e: TError) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError>> => {
    if (!r.ok) {
      return fn(r.error).then(() => r);
    }
    return Promise.resolve(r);
  };
}

/**
 * Handles Result errors by invoking async error handler safely.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Expected error type.
 * @typeParam TSideError - Side error type.
 * @param fn - Async function to handle error.
 * @param mapError - Transforms unknown errors.
 * @returns A function that accepts a Result and returns a Promise resolving to Result with original value or transformed error.
 * @example
 * const tapper = tapErrorAsyncSafe(
 *   async (e) => { throw new Error('fail'); },
 *   (err) => makeUnexpectedError(err, { message: 'Error tap failed' })
 * );
 * const res = await tapper(Err(someError)); // Err(AppError)
 */
export function tapErrorAsyncSafe<
  TValue,
  TError extends AppError,
  TSideError extends AppError,
>(
  fn: (e: TError) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError>> => {
    if (r.ok) {
      return r;
    }
    try {
      await fn(r.error);
      return r;
    } catch (e) {
      return Err(mapError(e));
    }
  };
}
