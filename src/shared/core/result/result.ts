// File: src/shared/core/result/result.ts

import type { ErrorLike } from "@/shared/core/result/error";

/**
 * Freezes an object to prevent mutation.
 */
const freezeObject = <T extends object>(obj: T): Readonly<T> =>
  Object.freeze(obj);

/**
 * Represents a successful Result.
 */
export type OkResult<TValue> = { readonly ok: true; readonly value: TValue };

/**
 * Represents a failed Result.
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
 * Extracts the success type from a `Result` type.
 */
export type OkType<R> = R extends { ok: true; value: infer U } ? U : never;

/**
 * Extracts the error type `E` from a `Result` type.
 */
export type ErrType<R> = R extends { ok: false; error: infer E } ? E : never;

/**
 * Creates a successful Result.
 */
export const Ok = /* @__PURE__ */ <TValue>(
  value: TValue,
): Result<TValue, never> => {
  const r = { ok: true as const, value } satisfies OkResult<TValue>;
  return freezeObject(r);
};

/**
 * Creates a failed Result.
 * TODO: Defaulting TError to AppError in core constructors can unintentionally widen error unions across layers.
 * TODO: Core should stay neutral; AppError defaults belong in adapter helpers.
 */
export const Err = /* @__PURE__ */ <TError extends ErrorLike>(
  error: TError,
): Result<never, TError> => {
  const r = { error, ok: false as const } satisfies ErrResult<TError>;
  return freezeObject(r);
};

/**
 * Type guard for OkResult.
 */
export const isOk = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): r is OkResult<TValue> => r.ok;

/**
 * Type guard for ErrResult.
 */
export const isErr = <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): r is ErrResult<TError> => !r.ok;

// Non-throwing unwrap helpers

export const toNullable = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): TValue | null => (r.ok ? r.value : null);

// Replace fromBoolean to preserve the actual boolean value (no forced `true`)
export const fromCondition = /* @__PURE__ */ <TError extends ErrorLike>(
  condition: boolean,
  onFalse: () => TError,
): Result<boolean, TError> => (condition ? Ok(true) : Err(onFalse()));

// Convert Result to boolean flags as a tuple
export const toFlags = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): readonly [isOk: boolean, isErr: boolean] => [r.ok, !r.ok] as const;
