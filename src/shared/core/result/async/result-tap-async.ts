// File: src/shared/core/result/result-tap-async.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/sync/result";
import { Err } from "@/shared/core/result/sync/result";

/**
 * Async side-effect on Ok branch (errors from fn propagate normally).
 * @template TValue
 * @template TError
 * @param fn Async consumer run only when Ok.
 * @returns Function applying the side-effect and returning original Result.
 */
export const tapOkAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (v: TValue) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (r.ok) {
        await fn(r.value);
      }
      return r;
    };

/**
 * Async side-effect on Err branch (errors from fn propagate normally).
 * @template TValue
 * @template TError
 * @param fn Async consumer run only when Err.
 * @returns Function applying the side-effect and returning original Result.
 */
export const tapErrorAsync =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike>(fn: (e: TError) => Promise<void>) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
      if (!r.ok) {
        await fn(r.error);
      }
      return r;
    };

/**
 * Safe async side-effect on Ok branch.
 * Overload (no mapper): thrown side-effect errors normalized to AppError.
 */
export function tapOkAsyncSafe<TValue, TError extends ErrorLike>(
  fn: (v: TValue) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | AppError>>;
/**
 * Safe async side-effect on Ok branch with custom error mapper.
 */
export function tapOkAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (v: TValue) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>>;
export function tapOkAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (v: TValue) => Promise<void>, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError | AppError>> => {
    if (r.ok) {
      try {
        await fn(r.value);
      } catch (e) {
        const mapped = mapError ? mapError(e) : normalizeUnknownError(e);
        return Err(mapped);
      }
    }
    return r;
  };
}

/**
 * Safe async side-effect on Err branch.
 * Overload (no mapper): thrown side-effect errors normalized to AppError.
 */
export function tapErrorAsyncSafe<TValue, TError extends ErrorLike>(
  fn: (e: TError) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | AppError>>;
/**
 * Safe async side-effect on Err branch with custom error mapper.
 */
export function tapErrorAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (e: TError) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>>;
export function tapErrorAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike = AppError,
>(fn: (e: TError) => Promise<void>, mapError?: (e: unknown) => TSideError) {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError | AppError>> => {
    if (!r.ok) {
      try {
        await fn(r.error);
      } catch (e) {
        const mapped = mapError ? mapError(e) : normalizeUnknownError(e);
        return Err(mapped);
      }
    }
    return r;
  };
}
