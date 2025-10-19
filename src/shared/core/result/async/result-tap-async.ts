// File: src/shared/core/result/async/result-tap-async.ts
// Purpose: Adapter-first async taps (no default AppError).

import type { ErrorLike } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Executes a provided asynchronous function if the given `Result` is successful (`ok`).
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the error. Defaults to `AppError`.
 * @param fn - An asynchronous function to execute with the successful value.
 * @returns A `Promise` resolving to the same `Result` passed as input.
 */
export const tapOkAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (v: TValue) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (r.ok) {
        await fn(r.value);
      }
      return r;
    };

/**
 * A utility function to safely execute an asynchronous operation on a `Result` object.
 * If the function `fn` throws, the error is mapped using `mapError`.
 *
 * @typeParam TValue - The type of the successful value in the `Result`.
 * @typeParam TError - The type of the original error in the `Result`.
 * @typeParam TSideError - The type of the mapped side error.
 * @param fn - The asynchronous function to execute if the `Result` is successful.
 * @param mapError - An optional function to map thrown `fn` errors to a `TSideError` instance.
 * @returns A new `Result` retaining its original value or wrapping any error encountered.
 */
export const tapOkAsyncSafe =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike, TSideError extends ErrorLike>(
      fn: (v: TValue) => Promise<void>,
      mapError: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
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

/**
 * Handles the error case of a `Result` asynchronously by executing a provided function.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the error, extending `ErrorLike`.
 * @param fn - An async function to process the error when the `Result` is not successful.
 * @returns A promise resolving to the unchanged `Result`.
 */
export const tapErrorAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (e: TError) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (!r.ok) {
        await fn(r.error);
      }
      return r;
    };

/**
 * Handles `Result` errors by invoking an asynchronous error handler function,
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the expected error.
 * @typeParam TSideError - The type of the optional side error.
 * @param fn - Async function to handle the error.
 * @param mapError - Optional function to transform unknown errors.
 * @returns A `Result` of the original value or the transformed error.
 */
export const tapErrorAsyncSafe =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike, TSideError extends ErrorLike>(
      fn: (e: TError) => Promise<void>,
      mapError: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
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
