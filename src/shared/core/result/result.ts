// src/shared/core/result/result.ts
import { IS_PROD } from "@/shared/config/env-shared";
import type { AppError, ErrorLike } from "@/shared/core/result/error";

/**
 * Dev-only freeze helper to discourage accidental mutation of Result objects.
 * No-op in production for performance.
 * @param obj Immutable target.
 * @returns Frozen (in dev) or original object.
 */
const freezeDev = <TObj extends object>(obj: TObj): TObj => {
  if (!IS_PROD) {
    Object.freeze(obj);
  }
  return obj;
};

/** Discriminant literal: success branch. */
export const RESULT_OK = true as const;
/** Discriminant literal: error branch. */
export const RESULT_ERR = false as const;

/** Successful Result branch. */
export type OkResult<TValue> = { readonly ok: true; readonly value: TValue };
/** Failed Result branch. */
export type ErrResult<TError extends ErrorLike> = {
  readonly ok: false;
  readonly error: TError;
};

/**
 * Discriminated union representing either success or failure.
 * @template TValue Success value type.
 * @template TError Error type.
 */
export type Result<TValue, TError extends ErrorLike> =
  | OkResult<TValue>
  | ErrResult<TError>;

/**
 * Construct a successful Result.
 * @template TValue
 * @template TError
 * @param value Success payload.
 */
export const Ok = /* @__PURE__ */ <TValue, TError extends ErrorLike = AppError>(
  value: TValue,
): Result<TValue, TError> => {
  const r = { ok: RESULT_OK, value } satisfies OkResult<TValue>;
  return freezeDev(r) as Result<TValue, TError>;
};

/**
 * Construct an error Result.
 * @template TValue
 * @template TError
 * @param error Error payload.
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

/** Type guard: value is Ok branch. */
export const isOk = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): r is OkResult<TValue> => r.ok;

/** Type guard: value is Err branch. */
export const isErr = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): r is ErrResult<TError> => !r.ok;

// Boundary helpers to enforce promotion to AppError at UI edges.

/**
 * Map a Result<T, BaseError|unknown> into Result<T, AppError>.
 * Keep ErrorLike constraint on TError for safety.
 */
export const mapErrorToApp = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
  toApp: (e: TError) => import("@/shared/core/result/error").AppError,
): Result<TValue, import("@/shared/core/result/error").AppError> =>
  r.ok ? r : ({ error: toApp(r.error), ok: false } as const);
