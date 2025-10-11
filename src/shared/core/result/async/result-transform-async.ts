// File: src/shared/core/result/async/result-transform-async.ts
// Purpose: Adapter-first async flatMap utilities (no default AppError).

import type { ErrorLike } from "@/shared/core/result/app-error";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Applies an asynchronous function to the successful value in a `Result` and flattens the resulting `Result`.
 *
 * @typeParam TValue - Type of the input value.
 * @typeParam TNext - Type of the resulting value after applying `fn`.
 * @typeParam TError1 - Type of the initial error in the input `Result`.
 * @typeParam TError2 - Type of the error that `fn` might return.
 * @param fn - An asynchronous function that transforms a value into a `Result`.
 * @returns A promise of `Result` with the transformed value or propagated errors.
 */
export const flatMapAsync =
  /* @__PURE__ */
    <TValue, TNext, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (v: TValue) => Promise<Result<TNext, TError2>>,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TNext, TError1 | TError2>> =>
      r.ok ? fn(r.value) : Err(r.error);

// Preserve-Err variant for async flatMap (no casting).
/**
 * Transforms a `Result` asynchronously via the provided function, ensuring any original errors are preserved.
 *
 * @typeParam TValue - The type of the input value in the `Result`.
 * @typeParam TNext - The type of the transformed value.
 * @typeParam TError1 - The type of the original error.
 * @typeParam TError2 - The type of any new error from the transformation function.
 * @param fn - A function that takes a value and returns a `Promise` of a transformed `Result`.
 * @returns A function that processes a `Result` and returns a `Promise` of a transformed `Result`.
 */
export const flatMapAsyncPreserveErr =
  /* @__PURE__ */
  <TValue, TNext, TError1 extends ErrorLike, TError2 extends ErrorLike>(
    fn: (v: TValue) => Promise<Result<TNext, TError2>>,
  ) => {
    /* @__PURE__ */
    return async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TNext, TError1 | TError2>> => {
      if (!r.ok) {
        return Err(r.error);
      }
      return await fn(r.value);
    };
  };

/**
 * Safely applies an asynchronous transformation to a `Result` value,
 * ensuring proper error handling and type safety.
 *
 * @typeParam TValue - The type of the input value in the `Result`.
 * @typeParam TNext - The type of the transformed value in the `Result`.
 * @typeParam TError1 - The type of the existing error in the `Result`.
 * @typeParam TError2 - The type of the error from the async function.
 * @typeParam TSideError - The type of the error from the error mapper.
 * @param fn - An async function transforming the value of `Result`.
 * @param mapError - Optional function to map unknown errors to `TSideError`.
 * @returns A `Promise` resolving to a new `Result` with transformed or error value.
 */
export const flatMapAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TNext,
      TError1 extends ErrorLike,
      TError2 extends ErrorLike,
      TSideError extends ErrorLike,
    >(
      fn: (v: TValue) => Promise<Result<TNext, TError2>>,
      mapError: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TNext, TError1 | TError2 | TSideError>> => {
      if (!r.ok) {
        return Err(r.error);
      }
      try {
        return await fn(r.value);
      } catch (e) {
        return Err(mapError(e));
      }
    };
