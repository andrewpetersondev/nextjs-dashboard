// File: src/shared/core/result/result.ts

import { IS_PROD } from "@/shared/config/env-shared";
import type { AppError, ErrorLike } from "@/shared/core/result/error";

/**
 * Freezes an object in development to prevent mutation; no-op in production.
 *
 * @typeParam TObj - The object type to freeze.
 * @param obj - The object to freeze.
 * @returns The frozen object in development, or the original in production.
 */
const freezeDev = <TObj extends object>(obj: TObj): TObj => {
  if (!IS_PROD) {
    Object.freeze(obj);
  }
  return obj;
};

/** Discriminant for successful Result. */
export const RESULT_OK = true as const;
/** Discriminant for failed Result. */
export const RESULT_ERR = false as const;

/**
 * Represents a successful Result.
 *
 * @typeParam TValue - The value type.
 */
export type OkResult<TValue> = { readonly ok: true; readonly value: TValue };

/**
 * Represents a failed Result.
 *
 * @typeParam TError - The error type, must extend ErrorLike.
 */
export type ErrResult<TError extends ErrorLike> = {
  readonly ok: false;
  readonly error: TError;
};

/**
 * Discriminated union for operation results.
 *
 * @typeParam TValue - The value type.
 * @typeParam TError - The error type, must extend ErrorLike.
 */
export type Result<TValue, TError extends ErrorLike> =
  | OkResult<TValue>
  | ErrResult<TError>;

/**
 * Creates a successful Result.
 *
 * @typeParam TValue - The value type.
 * @typeParam TError - The error type, must extend ErrorLike.
 * @param value - The success value.
 * @returns A Result with the value.
 */
export const Ok = /* @__PURE__ */ <TValue, TError extends ErrorLike = AppError>(
  value: TValue,
): Result<TValue, TError> => {
  const r = { ok: RESULT_OK, value } satisfies OkResult<TValue>;
  return freezeDev(r) as Result<TValue, TError>;
};

/**
 * Creates a failed Result.
 *
 * @typeParam TValue - The value type.
 * @typeParam TError - The error type, must extend ErrorLike.
 * @param error - The error value.
 * @returns A Result with the error.
 */
export const Err = /* @__PURE__ */ <
  TValue = never,
  TError extends ErrorLike = AppError,
>(
  error: TError,
): Result<TValue, TError> => {
  const r = { error, ok: RESULT_ERR } satisfies ErrResult<TError>;
  return freezeDev(r) as Result<TValue, TError>;
};

/**
 * Type guard for OkResult.
 *
 * @typeParam TValue - The value type.
 * @typeParam TError - The error type.
 * @param r - The Result to check.
 * @returns True if Result is Ok.
 */
export const isOk = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): r is OkResult<TValue> => r.ok;

/**
 * Type guard for ErrResult.
 *
 * @typeParam TValue - The value type.
 * @typeParam TError - The error type.
 * @param r - The Result to check.
 * @returns True if Result is Err.
 */
export const isErr = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): r is ErrResult<TError> => !r.ok;
