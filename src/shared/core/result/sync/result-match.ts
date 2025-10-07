// File: `src/shared/core/result/result-match.ts`

import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/sync/result";

/**
 * Unwrap or throw error branch.
 * @template TValue
 * @template TError
 * @param r Result to unwrap.
 * @returns TValue
 * @throws TError When Err.
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
 * Unwrap or return fallback constant.
 * @template TValue
 * @template TError
 * @param fallback Value used when Err.
 */
export const unwrapOr =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fallback: TValue) =>
    /* @__PURE__ */
    (r: Result<TValue, TError>): TValue =>
      r.ok ? r.value : fallback;

/**
 * Unwrap or compute fallback from error.
 * @template TValue
 * @template TError
 * @param fallback Function producing fallback from error.
 */
export const unwrapOrElse =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fallback: (e: TError) => TValue) =>
    /* @__PURE__ */
    (r: Result<TValue, TError>): TValue =>
      r.ok ? r.value : fallback(r.error);

/**
 * Pattern match both branches.
 * @template TValue
 * @template TError
 * @template TOut
 * @param r Result to match.
 * @param onOk Ok handler.
 * @param onErr Err handler.
 * @returns TOut
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
