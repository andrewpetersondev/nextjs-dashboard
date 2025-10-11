// File: src/shared/core/result/sync/result-match.ts

import type { ErrorLike } from "@/shared/core/result/app-error";
import type { Result } from "@/shared/core/result/result";

/**
 * Extracts the value from a successful `Result` or throws the associated error if unsuccessful.
 *
 * @typeParam TValue - The type of the value in case of success.
 * @typeParam TError - The type of the error, extending `ErrorLike`.
 * @param r - A `Result` object containing either a success value or an error.
 * @returns The value of type `TValue` if the result is successful.
 * @throws The error of type `TError` if the result is unsuccessful.
 */
export const unwrapOrThrow = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): TValue => {
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Returns the value from a `Result` if `ok`, otherwise returns the provided fallback.
 *
 * @typeParam TValue - The type of the successful result value.
 * @typeParam TError - The type of the error, extending `ErrorLike`.
 * @param fallback - The default value to return if the `Result` is not `ok`.
 * @returns The value from the `Result` or the fallback value.
 * @example
 * const result = unwrapOr(42)(someResult);
 */
export const unwrapOr =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fallback: TValue) =>
    /* @__PURE__ */
    (r: Result<TValue, TError>): TValue =>
      r.ok ? r.value : fallback;

/**
 * Returns the value of a successful `Result` or computes a fallback value using the provided function.
 *
 * @typeParam TValue - The type of the successful value contained in the `Result`.
 * @typeParam TError - The type of the error contained in the `Result`, extending `ErrorLike`.
 * @param fallback - A function that computes a fallback value based on the `TError`.
 * @returns The value if the `Result` is successful, otherwise the value returned by the `fallback` function.
 * @example
 * ```ts
 * const result = unwrapOrElse((error) => defaultValue)(someResult);
 * ```
 */
export const unwrapOrElse =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fallback: (e: TError) => TValue) =>
    /* @__PURE__ */
    (r: Result<TValue, TError>): TValue =>
      r.ok ? r.value : fallback(r.error);

/**
 * Matches a `Result` and applies the appropriate callback based on its state.
 *
 * @typeParam TValue - The type of the successful result's value.
 * @typeParam TError - The type of the error, extending `ErrorLike`.
 * @typeParam TOut - The return type of the callback functions.
 * @param r - The `Result` object to match.
 * @param onOk - Callback invoked with the value if `r` is successful.
 * @param onErr - Callback invoked with the error if `r` is an error.
 * @returns The result of the invoked callback.
 * @example
 * const result = Result.ok(42);
 * const message = matchResult(result, value => `Value is ${value}`, err => `Error: ${err.message}`);
 */
export const matchResult = /* @__PURE__ */ <
  TValue,
  TError extends ErrorLike,
  TOut,
>(
  r: Result<TValue, TError>,
  onOk: (v: TValue) => TOut,
  onErr: (e: TError) => TOut,
): TOut => (r.ok ? onOk(r.value) : onErr(r.error));

// Exhaustive match with constant outputs
export const matchTo =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike, TOut>(onOk: TOut, onErr: TOut) =>
    (r: Result<TValue, TError>): TOut =>
      r.ok ? onOk : onErr;
