// File: src/shared/core/result/async/result-map-async.ts
// Purpose: Adapter-first async map utilities (no default AppError).

import type { AppError } from "@/shared/core/result/app-error/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Asynchronously maps a successful `Result` to a new value using the provided function.
 *
 * @typeParam Tvalue - The type of the original value in the `Result`.
 * @typeParam Tnext - The type of the transformed value after applying the function.
 * @typeParam Terror - The type of the error, extending `AppError` (default: `AppError`).
 * @param fn - An async function to transform the value if the `Result` is successful.
 * @returns A `Promise` resolving to either a transformed `Result` or the original error.
 */
export const mapOkAsync =
  /* @__PURE__ */
    <Tvalue, Tnext, Terror extends AppError>(
      fn: (v: Tvalue) => Promise<Tnext>,
    ) =>
    /* @__PURE__ */
    async (r: Result<Tvalue, Terror>): Promise<Result<Tnext, Terror>> =>
      r.ok ? Ok(await fn(r.value)) : r;

/**
 * A utility function for safely transforming the value of a `Result` asynchronously.
 * If the `Result` is an error, the transformation is skipped. Errors from the async
 * operation can be required mapped to a custom error type.
 *
 * @alpha
 * @typeParam Tvalue - The type of the input value in the `Result`.
 * @typeParam Tnext - The type of the output value after transformation.
 * @typeParam Terror - The type of the error contained in the original `Result`.
 * @typeParam Tsideerror - The type of a side error thrown during transformation.
 * @param fn - An async function to transform the contained value on success.
 * @param mapError - An required function to map any exceptions thrown during `fn` execution.
 * @returns A `Promise` resolving to a new `Result` with transformed value or propagated error.
 * @example
 * ```ts
 * const transformAsync = async (n: number) => n * 2;
 * const result = await mapOkAsyncSafe(transformAsync)(Ok(3)); // Resolves to Ok(6)
 * ```
 */
export const mapOkAsyncSafe =
  /* @__PURE__ */
    <Tvalue, Tnext, Terror extends AppError, Tsideerror extends AppError>(
      fn: (v: Tvalue) => Promise<Tnext>,
      mapError: (e: unknown) => Tsideerror,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<Tvalue, Terror>,
    ): Promise<Result<Tnext, Terror | Tsideerror>> => {
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
 * Maps an error in an asynchronous `Result` with a provided transformation function.
 *
 * @typeParam Tvalue - The type of the success value.
 * @typeParam Terror1 - The type of the original error, defaults to `AppError`.
 * @typeParam Terror2 - The type of the transformed error, defaults to `AppError`.
 * @param fn - A function that transforms the original error into a new error asynchronously.
 * @returns A new `Result` with the error transformed by `fn` if the original `Result` is an error.
 * @example
 * ```ts
 * const result = await mapErrorAsync(async (e) => new CustomError(e.message))(someResult);
 * ```
 */
export const mapErrorAsync =
  /* @__PURE__ */
    <Tvalue, Terror1 extends AppError, Terror2 extends AppError>(
      fn: (e: Terror1) => Promise<Terror2>,
    ) =>
    /* @__PURE__ */
    async (r: Result<Tvalue, Terror1>): Promise<Result<Tvalue, Terror2>> =>
      r.ok ? r : Err(await fn(r.error));

/**
 * A utility function to safely transform errors in an asynchronous context.
 *
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror1 - The type of the initial error (extends `AppError`).
 * @typeParam Terror2 - The type of the transformed error (extends `AppError`).
 * @typeParam Tsideerror - The type of side-error from the `mapError` function (extends `AppError`).
 * @param fn - An async function that maps `Terror1` to `Terror2`.
 * @param mapError - Required function to handle unexpected errors.
 * @returns A `Promise` resolving to a `Result` containing the transformed error or successful value.
 * @example
 * ```ts
 * const result = await mapErrorAsyncSafe(async (err) => new CustomError(err.message))(someResult);
 * ```
 */
export const mapErrorAsyncSafe =
  /* @__PURE__ */
    <
      Tvalue,
      Terror1 extends AppError,
      Terror2 extends AppError,
      Tsideerror extends AppError,
    >(
      fn: (e: Terror1) => Promise<Terror2>,
      mapError: (e: unknown) => Tsideerror,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<Tvalue, Terror1>,
    ): Promise<Result<Tvalue, Terror2 | Tsideerror>> => {
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
