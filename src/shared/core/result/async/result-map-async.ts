// File: src/shared/core/result/async/result-map-async.ts

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { ErrorLike } from "@/shared/core/result/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Asynchronously maps a successful `Result` to a new value using the provided function.
 *
 * @typeParam TValue - The type of the original value in the `Result`.
 * @typeParam TNext - The type of the transformed value after applying the function.
 * @typeParam TError - The type of the error, extending `ErrorLike` (default: `AppError`).
 * @param fn - An async function to transform the value if the `Result` is successful.
 * @returns A `Promise` resolving to either a transformed `Result` or the original error.
 */
export const mapOkAsync =
  /* @__PURE__ */
    <TValue, TNext, TError extends ErrorLike>(
      fn: (v: TValue) => Promise<TNext>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TNext, TError>> =>
      r.ok ? Ok(await fn(r.value)) : r;

/**
 * A utility function for safely transforming the value of a `Result` asynchronously.
 * If the `Result` is an error, the transformation is skipped. Errors from the async
 * operation can be optionally mapped to a custom error type.
 *
 * @alpha
 * @typeParam TValue - The type of the input value in the `Result`.
 * @typeParam TNext - The type of the output value after transformation.
 * @typeParam TError - The type of the error contained in the original `Result`.
 * @typeParam TSideError - The type of a side error thrown during transformation.
 * @param fn - An async function to transform the contained value on success.
 * @param mapError - An optional function to map any exceptions thrown during `fn` execution.
 * @returns A `Promise` resolving to a new `Result` with transformed value or propagated error.
 * @example
 * ```ts
 * const transformAsync = async (n: number) => n * 2;
 * const result = await mapOkAsyncSafe(transformAsync)(Ok(3)); // Resolves to Ok(6)
 * ```
 */
export const mapOkAsyncSafe =
  /* @__PURE__ */
    <TValue, TNext, TError extends ErrorLike, TSideError extends ErrorLike>(
      fn: (v: TValue) => Promise<TNext>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError>,
    ): Promise<Result<TNext, TError | TSideError>> => {
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

/**
 * Maps an error in an asynchronous `Result` with a provided transformation function.
 *
 * @typeParam TValue - The type of the success value.
 * @typeParam TError1 - The type of the original error, defaults to `AppError`.
 * @typeParam TError2 - The type of the transformed error, defaults to `AppError`.
 * @param fn - A function that transforms the original error into a new error asynchronously.
 * @returns A new `Result` with the error transformed by `fn` if the original `Result` is an error.
 * @example
 * ```ts
 * const result = await mapErrorAsync(async (e) => new CustomError(e.message))(someResult);
 * ```
 */
export const mapErrorAsync =
  /* @__PURE__ */
    <TValue, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (e: TError1) => Promise<TError2>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError1>): Promise<Result<TValue, TError2>> =>
      r.ok ? r : Err(await fn(r.error));

/**
 * A utility function to safely transform errors in an asynchronous context.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError1 - The type of the initial error (extends `ErrorLike`).
 * @typeParam TError2 - The type of the transformed error (extends `ErrorLike`).
 * @typeParam TSideError - The type of side-error from the `mapError` function (extends `ErrorLike`).
 * @param fn - An async function that maps `TError1` to `TError2`.
 * @param mapError - Optional function to handle unexpected errors, defaulting to `toAppErrorFromUnknown`.
 * @returns A `Promise` resolving to a `Result` containing the transformed error or successful value.
 * @example
 * ```ts
 * const result = await mapErrorAsyncSafe(async (err) => new CustomError(err.message))(someResult);
 * ```
 */
export const mapErrorAsyncSafe =
  /* @__PURE__ */
    <
      TValue,
      TError1 extends ErrorLike,
      TError2 extends ErrorLike,
      TSideError extends ErrorLike,
    >(
      fn: (e: TError1) => Promise<TError2>,
      mapError?: (e: unknown) => TSideError,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TValue, TError2 | TSideError>> => {
      if (r.ok) {
        return Ok(r.value);
      }
      try {
        const next = await fn(r.error);
        return Err(next);
      } catch (e) {
        const err = (mapError ?? toAppErrorFromUnknown)(e);
        return Err(err);
      }
    };
