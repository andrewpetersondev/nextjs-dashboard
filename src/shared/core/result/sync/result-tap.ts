// File: src/shared/core/result/result-tap.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Side-effect on success branch (does not alter Result).
 * @template TValue
 * @template TError
 * @param fn Consumer invoked only for Ok branch.
 * @returns Function applying the side-effect.
 */
export const tapOk =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (v: TValue) => void) =>
    (r: Result<TValue, TError>): Result<TValue, TError> => {
      if (r.ok) {
        fn(r.value);
      }
      return r;
    };

/**
 * Side-effect on error branch (does not alter Result).
 * @template TValue
 * @template TError
 * @param fn Consumer invoked only for Err branch.
 * @returns Function applying the side-effect.
 */
export const tapError =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (e: TError) => void) =>
    (r: Result<TValue, TError>): Result<TValue, TError> => {
      if (!r.ok) {
        fn(r.error);
      }
      return r;
    };

/**
 * Safe side-effect on Ok branch.
 * Overload 1: Without mapper (side-effect errors normalized to AppError).
 * @template TValue
 * @template TError
 * @param fn Consumer that may throw.
 * @returns Function producing Result with possible AppError extension.
 */
export function tapOkSafe<TValue, TError extends ErrorLike>(
  fn: (v: TValue) => void,
): (r: Result<TValue, TError>) => Result<TValue, TError | AppError>;
/**
 * Safe side-effect on Ok branch.
 * Overload 2: With custom error mapper.
 * @template TValue
 * @template TError
 * @template TSideError
 * @param fn Consumer that may throw.
 * @param mapError Maps unknown thrown value to custom error type.
 * @returns Function producing Result with extended error union.
 */
export function tapOkSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (v: TValue) => void,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Result<TValue, TError | TSideError>;
export function tapOkSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (v: TValue) => void, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Result<TValue, TError | TSideError | AppError> => {
    if (r.ok) {
      try {
        fn(r.value);
      } catch (e) {
        const sideErr = mapError ? mapError(e) : normalizeUnknownError(e); // AppError
        return Err(sideErr);
      }
    }
    return r;
  };
}

/**
 * Safe side-effect on Err branch.
 * Overload 1: Without mapper (thrown errors normalized to AppError).
 * @template TValue
 * @template TError
 * @param fn Consumer that may throw.
 */
export function tapErrorSafe<TValue, TError extends ErrorLike>(
  fn: (e: TError) => void,
): (r: Result<TValue, TError>) => Result<TValue, TError | AppError>;
/**
 * Safe side-effect on Err branch with custom error mapper.
 * @template TValue
 * @template TError
 * @template TSideError
 * @param fn Consumer that may throw.
 * @param mapError Custom mapper for thrown side-effect errors.
 */
export function tapErrorSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (e: TError) => void,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Result<TValue, TError | TSideError>;
export function tapErrorSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (e: TError) => void, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Result<TValue, TError | TSideError | AppError> => {
    if (!r.ok) {
      try {
        fn(r.error);
      } catch (e) {
        const sideErr = mapError ? mapError(e) : normalizeUnknownError(e); // AppError
        return Err(sideErr);
      }
    }
    return r;
  };
}
