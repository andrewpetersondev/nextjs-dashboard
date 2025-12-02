import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Async maps successful Result to new value.
 *
 * @typeParam T - Original value type.
 * @typeParam T2 - Transformed value type.
 * @typeParam E - Error type extending AppError.
 * @param fn - Async function to transform value.
 * @returns Promise resolving to transformed Result or original error.
 */
export const mapOkAsync =
  /* @__PURE__ */
    <T, T2, E extends AppError>(fn: (v: T) => Promise<T2>) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T2, E>> =>
      r.ok ? Ok(await fn(r.value)) : r;

/**
 * Safely transforms Result value asynchronously, mapping thrown errors.
 *
 * @typeParam T - Input value type.
 * @typeParam T2 - Output value type.
 * @typeParam E - Original error type.
 * @typeParam E2 - Side error type from transformation.
 * @param fn - Async function to transform value.
 * @param mapError - Maps exceptions during execution.
 * @returns Promise resolving to new Result with transformed value or error.
 */
export const mapOkAsyncSafe =
  /* @__PURE__ */
    <T, T2, E extends AppError, E2 extends AppError>(
      fn: (v: T) => Promise<T2>,
      mapError: (e: unknown) => E2,
    ) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T2, E | E2>> => {
      if (!r.ok) {
        return r;
      }
      try {
        const next = await fn(r.value);
        return Ok(next);
      } catch (e) {
        return Err(mapError(e));
      }
    };

/**
 * Maps error in async Result with transformation function.
 *
 * @typeParam T - Success value type.
 * @typeParam E - Original error type.
 * @typeParam E2 - Transformed error type.
 * @param fn - Transforms original error to new error asynchronously.
 * @returns New Result with transformed error or original value.
 */
export const mapErrorAsync =
  /* @__PURE__ */
    <T, E extends AppError, E2 extends AppError>(fn: (e: E) => Promise<E2>) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T, E2>> =>
      r.ok ? r : Err(await fn(r.error));

/**
 * Safely transforms errors asynchronously, handling unexpected errors.
 *
 * @typeParam T - Successful result value type.
 * @typeParam E - Initial error type extending AppError.
 * @typeParam E2 - Transformed error type extending AppError.
 * @typeParam E3 - Side-error type from mapError function.
 * @param fn - Async function mapping E to E2.
 * @param mapError - Handles unexpected errors.
 * @returns Promise resolving to Result with transformed error or value.
 */
export const mapErrorAsyncSafe =
  /* @__PURE__ */
    <T, E extends AppError, E2 extends AppError, E3 extends AppError>(
      fn: (e: E) => Promise<E2>,
      mapError: (e: unknown) => E3,
    ) =>
    /* @__PURE__ */
    async (r: Result<T, E>): Promise<Result<T, E2 | E3>> => {
      if (r.ok) {
        return Ok(r.value);
      }
      try {
        const next = await fn(r.error);
        return Err(next);
      } catch (e) {
        return Err(mapError(e));
      }
    };
