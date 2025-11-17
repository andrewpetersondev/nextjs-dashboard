// File: src/shared/core/result/async/result-tap-async.ts
// Purpose: Adapter-first async taps (no default AppError).

import type { AppError } from "@/shared/errors/app-error/app-error";
import type { Result } from "@/shared/result/result";
import { Err } from "@/shared/result/result";

/**
 * Executes a provided asynchronous function if the given `Result` is successful (`ok`).
 *
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the error. Defaults to `AppError`.
 * @param fn - An asynchronous function to execute with the successful value.
 * @returns A `Promise` resolving to the same `Result` passed as input.
 */
export const tapOkAsync =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(fn: (v: Tvalue) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<Tvalue, Terror>): Promise<Result<Tvalue, Terror>> => {
      if (r.ok) {
        await fn(r.value);
      }
      return r;
    };

/**
 * A utility function to safely execute an asynchronous operation on a `Result` object.
 * If the function `fn` throws, the error is mapped using `mapError`.
 *
 * @typeParam Tvalue - The type of the successful value in the `Result`.
 * @typeParam Terror - The type of the original error in the `Result`.
 * @typeParam Tsideerror - The type of the mapped side error.
 * @param fn - The asynchronous function to execute if the `Result` is successful.
 * @param mapError - An optional function to map thrown `fn` errors to a `Tsideerror` instance.
 * @returns A new `Result` retaining its original value or wrapping any error encountered.
 */
export const tapOkAsyncSafe =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError, Tsideerror extends AppError>(
      fn: (v: Tvalue) => Promise<void>,
      mapError: (e: unknown) => Tsideerror,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<Tvalue, Terror>,
    ): Promise<Result<Tvalue, Terror | Tsideerror>> => {
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
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the error, extending `AppError`.
 * @param fn - An async function to process the error when the `Result` is not successful.
 * @returns A promise resolving to the unchanged `Result`.
 */
export const tapErrorAsync =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(fn: (e: Terror) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<Tvalue, Terror>): Promise<Result<Tvalue, Terror>> => {
      if (!r.ok) {
        await fn(r.error);
      }
      return r;
    };

/**
 * Handles `Result` errors by invoking an asynchronous error handler function,
 *
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the expected error.
 * @typeParam Tsideerror - The type of the optional side error.
 * @param fn - Async function to handle the error.
 * @param mapError - Optional function to transform unknown errors.
 * @returns A `Result` of the original value or the transformed error.
 */
export const tapErrorAsyncSafe =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError, Tsideerror extends AppError>(
      fn: (e: Terror) => Promise<void>,
      mapError: (e: unknown) => Tsideerror,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<Tvalue, Terror>,
    ): Promise<Result<Tvalue, Terror | Tsideerror>> => {
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
