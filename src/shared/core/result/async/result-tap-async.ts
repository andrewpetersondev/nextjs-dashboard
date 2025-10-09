// File: src/shared/core/result/async/result-tap-async.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Applies an asynchronous side-effect function to the `value` of a successful `Result` without altering it.
 *
 * @alpha
 * @typeParam TValue - The type of the successful value in the `Result`.
 * @typeParam TError - The type of the error in the `Result`, must extend `ErrorLike`.
 * @param fn - An asynchronous function to execute if the `Result` is successful.
 * @returns A promise resolving to the original `Result`.
 * @example
 * const result = await tapOkAsync(async (value) => console.log(value))(someResult);
 */
export const tapOkAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike = AppError>(
      fn: (v: TValue) => Promise<void>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (r.ok) {
        await fn(r.value);
      }
      return r;
    };

/**
 * Safe async tap for Ok branch; catches mapper exceptions into Err.
 */
export const tapOkAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TError extends ErrorLike = AppError,
      TSideError extends ErrorLike = AppError,
    >(
      fn: (v: TValue) => Promise<void>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError>,
    ): Promise<Result<TValue, TError | TSideError | AppError>> => {
      if (!r.ok) {
        return r;
      }
      try {
        await fn(r.value);
        return r;
      } catch (e) {
        const err = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(err);
      }
    };

/**
 * Asynchronously executes a provided function if the `Result` contains an error.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type extending `ErrorLike` for the error value.
 * @param fn - A function that processes the error and returns a Promise.
 * @returns The original `Result` object after handling the error.
 * @example
 * ```ts
 * const logError = async (err: Error) => { console.error(err.message); };
 * const result = await tapErrorAsync(logError)(someResult);
 * ```
 */
export const tapErrorAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike = AppError>(
      fn: (e: TError) => Promise<void>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (!r.ok) {
        await fn(r.error);
      }
      return r;
    };

/**
 * Safe async tap for Err branch; catches mapper exceptions into Err.
 */
export const tapErrorAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TError extends ErrorLike = AppError,
      TSideError extends ErrorLike = AppError,
    >(
      fn: (e: TError) => Promise<void>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError>,
    ): Promise<Result<TValue, TError | TSideError | AppError>> => {
      if (r.ok) {
        return r;
      }
      try {
        await fn(r.error);
        return r;
      } catch (e) {
        const err = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(err);
      }
    };
