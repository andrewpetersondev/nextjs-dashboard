// File: src/shared/core/result/result-tap-async.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { normalizeUnknownError } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import { Err } from "@/shared/core/result/result";

/**
 * Run an async side‑effect when `Ok` .
 * Errors thrown/rejected by `fn` are not caught and will reject the returned Promise.
 * The underlying `Result` value/error is never changed.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param fn Async consumer invoked only for `Ok` results.
 * @returns Unary function that applies the side‑effect and resolves to the original `Result`.
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
 * Run an async side‑effect when `Err`.
 * Errors thrown/rejected by `fn` are not caught and will reject the returned Promise.
 * The underlying `Result` value/error is never changed.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param fn Async consumer invoked only for `Err` results.
 * @returns Unary function that applies the side‑effect and resolves to the original `Result`.
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
 * Safe async side‑effect when `Ok` (no mapper).
 * Catches any error thrown/rejected by `fn` and converts it to `AppError` via `normalizeUnknownError`.
 * Returns the original `Result` on success; returns `Err<AppError>` if the side‑effect fails.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param fn Async consumer invoked only for `Ok` results.
 * @returns Function `Result<TValue, TError> -> Promise<Result<TValue, TError | AppError>>`.
 */
export function tapOkAsyncSafe<TValue, TError extends ErrorLike>(
  fn: (v: TValue) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | AppError>>;
/**
 * Safe async side‑effect when `Ok` with a custom mapper.
 * Catches any error from `fn` and maps it with `mapError` to `TSideError`.
 * Returns the original `Result` on success; returns `Err<TSideError>` if the side‑effect fails.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @typeParam TSideError Error type produced by `mapError`.
 * @param fn Async consumer invoked only for `Ok` results.
 * @param mapError Mapper from unknown to `TSideError`.
 * @returns Function `Result<TValue, TError> -> Promise<Result<TValue, TError | TSideError>>`.
 */
export function tapOkAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (v: TValue) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>>;

/**
 * Safe async side‑effect when `Ok` (implementation).
 * Uses optional `mapError` to convert thrown/rejected errors to `TSideError`; otherwise normalizes to `AppError`.
 * Returns the original `Result` on success; returns `Err<TSideError | AppError>` if the side‑effect fails.
 * See overloads for precise types.
 */
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
 * Safe async side‑effect when `Err` (no mapper).
 * Catches any error thrown/rejected by `fn` and converts it to `AppError` via `normalizeUnknownError`.
 * Returns the original `Result` on success; returns `Err<AppError>` if the side‑effect fails.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @param fn Async consumer invoked only for `Err` results.
 * @returns Function `Result<TValue, TError> -> Promise<Result<TValue, TError | AppError>>`.
 */
export function tapErrorAsyncSafe<TValue, TError extends ErrorLike>(
  fn: (e: TError) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | AppError>>;

/**
 * Safe async side‑effect when `Err` with a custom mapper.
 * Catches any error from `fn` and maps it with `mapError` to `TSideError`.
 * Returns the original `Result` on success; returns `Err<TSideError>` if the side‑effect fails.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type of the input `Result`.
 * @typeParam TSideError Error type produced by `mapError`.
 * @param fn Async consumer invoked only for `Err` results.
 * @param mapError Mapper from unknown to `TSideError`.
 * @returns Function `Result<TValue, TError> -> Promise<Result<TValue, TError | TSideError>>`.
 */
export function tapErrorAsyncSafe<
  TValue,
  TError extends ErrorLike,
  TSideError extends ErrorLike,
>(
  fn: (e: TError) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>>;

/**
 * Safe async side‑effect when \`Err\` (implementation).
 * Uses optional \`mapError\` to convert thrown/rejected errors to \`TSideError\`; otherwise normalizes to \`AppError\`.
 * Returns the original \`Result\` on success; returns \`Err<TSideError | AppError>\` if the side‑effect fails.
 * See overloads for precise types.
 */
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
