// File: src/shared/core/result/async/result-map-async.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Map the Ok branch of a `Result` using an async transformer.
 *
 * - If `r.ok === true`, awaits `fn(r.value)` and returns `Ok<TNext>`.
 * - If `r.ok === false`, returns the original `Err` unchanged.
 *
 * Pure, curried helper; does not catch exceptions from `fn`.
 *
 * @typeParam TValue - Input Ok value type.
 * @typeParam TNext - Output Ok value type after transformation.
 * @typeParam TError - Error type propagated unchanged.
 * @param fn - Async transformer applied to the Ok value.
 * @returns Function that maps a `Result<TValue, TError>` to `Promise<Result<TNext, TError>>`.
 * @example
 * const toUpper = mapOkAsync((s: string) => Promise.resolve(s.toUpperCase()));
 * const r = await toUpper(Ok("x")); // → { ok: true, value: "X" }
 */
export const mapOkAsync =
  /* @__PURE__ */
    <TValue, TNext, TError extends ErrorLike = AppError>(
      fn: (v: TValue) => Promise<TNext>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TNext, TError>> =>
      r.ok ? Ok(await fn(r.value)) : r;

/**
 * Safe variant of mapOkAsync that captures exceptions from the async mapper.
 */
export const mapOkAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TNext,
      TError extends ErrorLike = AppError,
      TSideError extends ErrorLike = AppError,
    >(
      fn: (v: TValue) => Promise<TNext>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError>,
    ): Promise<Result<TNext, TError | TSideError | AppError>> => {
      if (!r.ok) {
        return r;
      }
      try {
        const next = await fn(r.value);
        return Ok(next);
      } catch (e) {
        const err = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(err);
      }
    };

export const mapErrorAsync =
  /* @__PURE__ */
    <
      TValue,
      TError1 extends ErrorLike = AppError,
      TError2 extends ErrorLike = AppError,
    >(
      fn: (e: TError1) => Promise<TError2>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError1>): Promise<Result<TValue, TError2>> =>
      r.ok ? r : Err<TValue, TError2>(await fn(r.error));

export const mapErrorAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TError1 extends ErrorLike = AppError,
      TError2 extends ErrorLike = AppError,
      TSideError extends ErrorLike = AppError,
    >(
      fn: (e: TError1) => Promise<TError2>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TValue, TError2 | TSideError | AppError>> => {
      if (r.ok) {
        return Ok<TValue, TError2>(r.value);
      }
      try {
        const next = await fn(r.error);
        return Err<TValue, TError2>(next);
      } catch (e) {
        const err = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(err);
      }
    };
