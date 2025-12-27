import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Applies async function to successful value and flattens resulting Result.
 *
 * @typeParam T - Input value type.
 * @typeParam T2 - Resulting value type.
 * @typeParam E - Initial error type.
 * @typeParam E2 - Error type from function.
 * @param fn - Async function transforming value into Result.
 * @returns Promise of Result with transformed value or errors.
 */
export const flatMapAsync =
  /* @__PURE__ */
    <T, T2, E extends AppError, E2 extends AppError>(
      fn: (v: T) => Promise<Result<T2, E2>>,
    ) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T2, E | E2>> =>
      r.ok ? await fn(r.value) : r;

/**
 * Transforms Result asynchronously, preserving original errors.
 *
 * @typeParam T - Input value type.
 * @typeParam T2 - Transformed value type.
 * @typeParam E - Original error type.
 * @typeParam E2 - New error type from transformation.
 * @param fn - Takes value and returns Promise of transformed Result.
 * @returns Function processing Result and returning Promise of transformed Result.
 */
export const flatMapAsyncPreserveErr =
  /* @__PURE__ */
  <T, T2, E extends AppError, E2 extends AppError>(
    fn: (v: T) => Promise<Result<T2, E2>>,
  ) => {
    /* @__PURE__ */
    return async (r: Result<T, E>): Promise<Result<T2, E | E2>> => {
      if (!r.ok) {
        return r;
      }
      return await fn(r.value);
    };
  };

/**
 * Safely applies async transformation to Result value with error handling.
 *
 * @typeParam T - Input value type.
 * @typeParam T2 - Transformed value type.
 * @typeParam E - Existing error type.
 * @typeParam E2 - Error type from async function.
 * @typeParam E3 - Error type from error mapper.
 * @param fn - Async function transforming Result value.
 * @param mapError - Maps unknown errors to E3.
 * @returns Promise resolving to new Result with transformed or error value.
 */
export const flatMapAsyncSafe =
  /* @__PURE__ */
    <T, T2, E extends AppError, E2 extends AppError, E3 extends AppError>(
      fn: (v: T) => Promise<Result<T2, E2>>,
      mapError: (e: unknown) => E3,
    ) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T2, E | E2 | E3>> => {
      if (!r.ok) {
        return r;
      }
      try {
        return await fn(r.value);
      } catch (e) {
        return Err(mapError(e));
      }
    };
