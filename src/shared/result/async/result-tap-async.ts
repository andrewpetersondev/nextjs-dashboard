import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Executes async function if Result is successful.
 *
 * @typeParam T - Successful result value type.
 * @typeParam E - Error type, defaults to AppError.
 * @param fn - Async function to execute with value.
 * @returns Promise resolving to same Result.
 */
export const tapOkAsync =
  /* @__PURE__ */
    <T, E extends AppError>(fn: (v: T) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T, E>> => {
      if (r.ok) {
        await fn(r.value);
      }
      return r;
    };

/**
 * Safely executes async operation on Result, mapping thrown errors.
 *
 * @typeParam T - Successful value type.
 * @typeParam E - Original error type.
 * @typeParam E2 - Mapped side error type.
 * @param fn - Async function to execute if successful.
 * @param mapError - Maps thrown errors to E2.
 * @returns New Result retaining value or wrapping error.
 */
export const tapOkAsyncSafe =
  /* @__PURE__ */
    <T, E extends AppError, E2 extends AppError>(
      fn: (v: T) => Promise<void>,
      mapError: (e: unknown) => E2,
    ) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T, E | E2>> => {
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

/**
 * Handles Result error case asynchronously by executing function.
 *
 * @typeParam T - Successful result value type.
 * @typeParam E - Error type extending AppError.
 * @param fn - Async function to process error.
 * @returns Promise resolving to unchanged Result.
 */
export const tapErrorAsync =
  /* @__PURE__ */
    <T, E extends AppError>(fn: (e: E) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T, E>> => {
      if (!r.ok) {
        await fn(r.error);
      }
      return r;
    };

/**
 * Handles Result errors by invoking async error handler.
 *
 * @typeParam T - Successful result value type.
 * @typeParam E - Expected error type.
 * @typeParam E2 - Side error type.
 * @param fn - Async function to handle error.
 * @param mapError - Transforms unknown errors.
 * @returns Result with original value or transformed error.
 */
export const tapErrorAsyncSafe =
  /* @__PURE__ */
    <T, E extends AppError, E2 extends AppError>(
      fn: (e: E) => Promise<void>,
      mapError: (e: unknown) => E2,
    ) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T, E | E2>> => {
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
