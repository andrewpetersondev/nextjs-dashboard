import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Applies async function to successful value and flattens resulting Result.
 *
 * @typeParam TValue - Input value type.
 * @typeParam TNextValue - Resulting value type.
 * @typeParam TError - Initial error type.
 * @typeParam TNextError - Error type from function.
 * @param fn - Async function transforming value into Result.
 * @returns A function that accepts a Result and returns a Promise resolving to Result with transformed value or errors.
 * @example
 * const flatter = flatMapAsync(async (v: number) => Ok(v * 2));
 * const res = await flatter(Ok(5)); // Ok(10)
 */
export function flatMapAsync<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
>(
  fn: (v: TValue) => Promise<Result<TNextValue, TNextError>>,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TNextValue, TError | TNextError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError | TNextError>> =>
    r.ok ? fn(r.value) : Promise.resolve(r);
}

/**
 * Safely applies async transformation to Result value with error handling.
 *
 * @typeParam TValue - Input value type.
 * @typeParam TNextValue - Transformed value type.
 * @typeParam TError - Existing error type.
 * @typeParam TNextError - Error type from async function.
 * @typeParam TSideError - Error type from error mapper.
 * @param fn - Async function transforming Result value.
 * @param mapError - Maps unknown errors to TSideError.
 * @returns A function that accepts a Result and returns a Promise resolving to new Result with transformed or error value.
 * @example
 * const flatter = flatMapAsyncSafe(
 *   async (v: number) => Ok(v * 2),
 *   (e) => makeUnexpectedError(e, { message: 'Flat map failed' })
 * );
 * const res = await flatter(Ok(5)); // Ok(10)
 */
export function flatMapAsyncSafe<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
  TSideError extends AppError,
>(
  fn: (v: TValue) => Promise<Result<TNextValue, TNextError>>,
  mapError: (e: unknown) => TSideError,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TNextValue, TError | TNextError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError | TNextError | TSideError>> => {
    if (!r.ok) {
      return r;
    }
    try {
      return await fn(r.value);
    } catch (e) {
      return Err(mapError(e));
    }
  };
}
