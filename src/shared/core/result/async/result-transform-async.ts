// File: src/shared/core/result/async/result-transform-async.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Asynchronously maps the `Ok` branch of a `Result` using the provided async function.
 *
 * If the input result is `ok`, applies the async mapper and returns its result.
 * If the input result is `error`, returns the error unchanged (typed to the new result).
 *
 * @typeParam TValue The value type of the input result.
 * @typeParam TNext The value type of the mapped result.
 * @typeParam TError1 The error type of the input result.
 * @typeParam TError2 The error type of the mapped result.
 * @param fn An async function that maps a value of type `TValue` to a `Result<TNext, TError2>`.
 * @returns A function that takes a `Result<TValue, TError1>` and returns a `Promise<Result<TNext, TError1 | TError2>>`.
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
      r.ok ? fn(r.value) : Err<TNext, TError1>(r.error);

// Preserve-Err variant for async flatMap (no casting).
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
        return Err<TNext, TError1>(r.error);
      }
      return await fn(r.value);
    };
  };

/**
 * Safe variant of flatMapAsync that catches exceptions thrown by the async mapper.
 */
export const flatMapAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TNext,
      TError1 extends ErrorLike,
      TError2 extends ErrorLike,
      TSideError extends ErrorLike = AppError,
    >(
      fn: (v: TValue) => Promise<Result<TNext, TError2>>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TNext, TError1 | TError2 | TSideError | AppError>> => {
      if (!r.ok) {
        return Err<TNext, TError1>(r.error);
      }
      try {
        return await fn(r.value);
      } catch (e) {
        const err = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(err);
      }
    };
