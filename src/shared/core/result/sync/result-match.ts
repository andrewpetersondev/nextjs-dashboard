// File: src/shared/core/result/sync/result-match.ts

import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";

/**
 * Unwraps `Ok` or throws the contained error when `Err`.
 * Preserves `TError`; no normalization or mapping. Pure helper.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param r Input `Result`.
 * @returns `TValue` when `Ok`.
 * @throws `TError` when `Err`.
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
 * Unwraps `Ok` or returns a fallback constant when `Err`.
 * Fallback is not computed; it is used as provided.
 * Curried: supply `fallback`, then pass the `Result`.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param fallback Value used only when `Err`.
 * @returns Function `Result<TValue, TError> -> TValue`.
 */
export const unwrapOr =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fallback: TValue) =>
    /* @__PURE__ */
    (r: Result<TValue, TError>): TValue =>
      r.ok ? r.value : fallback;

/**
 * Unwraps `Ok` or computes a fallback from the error when `Err`.
 * `fallback` is invoked only for the `Err` branch.
 * Curried helper.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param fallback Function mapping `TError` to `TValue`.
 * @returns Function `Result<TValue, TError> -> TValue`.
 */
export const unwrapOrElse =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fallback: (e: TError) => TValue) =>
    /* @__PURE__ */
    (r: Result<TValue, TError>): TValue =>
      r.ok ? r.value : fallback(r.error);

/**
 * Exhaustively matches a `Result`, applying the corresponding handler.
 * Forwards the original value or error; no mapping or normalization.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @typeParam TOut Return type of both handlers.
 * @param r Input `Result` to match.
 * @param onOk Handler for the `Ok` branch.
 * @param onErr Handler for the `Err` branch.
 * @returns `TOut` from the selected handler.
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
