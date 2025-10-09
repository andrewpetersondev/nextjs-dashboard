// File: src/shared/core/result/result.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";

/**
 * Freezes an object to prevent mutation.
 *
 * @typeParam TObj - The object type to freeze.
 * @param obj - The object to freeze.
 * @returns The frozen object.
 */
const freezeObject = <TObj extends object>(obj: TObj): TObj =>
  Object.freeze(obj);

/** Discriminant for successful Result. */
const RESULT_OK = true as const;
/** Discriminant for failed Result. */
const RESULT_ERR = false as const;

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
 * Extracts the success type from a `Result` type.
 *
 * @typeParam R - A type that extends `Result` with an error of type `ErrorLike`.
 * @returns The success type `U` if `R` is a `Result<U, ErrorLike>`, otherwise `never`.
 * @example
 * ```
 * type Success = OkType<Result<string, Error>>;
 * // Success is `string`
 * ```
 */
export type OkType<R> = R extends Result<infer U, ErrorLike> ? U : never;

/**
 * Extracts the error type `E` from a `Result` type.
 *
 * @typeParam R - The `Result` type to extract the error type from.
 * @returns The extracted error type `E`, or `never` if not applicable.
 * @example
 * ```ts
 * type Error = ErrType<Result<number, string>>; // string
 * ```
 * @see Result
 */
export type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

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
  return freezeObject(r) as Result<TValue, TError>;
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
  return freezeObject(r) as Result<TValue, TError>;
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

// Non-throwing unwrap helpers

export const toNullable = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): TValue | null => (r.ok ? r.value : null);

export const toUndefined = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): TValue | undefined => (r.ok ? r.value : undefined);

// Convenience: boolean constructor

/**
 * Creates a `Result` based on a boolean condition.
 *
 * @typeParam TError - The type of error returned if the condition is `false`. Defaults to `AppError`.
 * @param condition - A boolean value determining the result.
 * @param onFalse - A callback function invoked to generate the error when `condition` is `false`.
 * @returns A `Result` containing `true` if `condition` is `true`, or the provided error otherwise.
 * @example
 * ```typescript
 * const result = fromBoolean(true, () => new Error("Condition failed"));
 * ```
 */
export const fromBoolean = /* @__PURE__ */ <
  TError extends ErrorLike = AppError,
>(
  condition: boolean,
  onFalse: () => TError,
): Result<true, TError> => (condition ? Ok(true) : Err(onFalse()));

// Safe extractors

export const getOk = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): TValue | undefined => (r.ok ? r.value : undefined);

export const getErr = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): TError | undefined => (r.ok ? undefined : r.error);

// Option-like conversions

export const toSomeNone = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
):
  | { readonly some: true; readonly value: TValue }
  | { readonly some: false } =>
  r.ok ? { some: true as const, value: r.value } : { some: false as const };

export const toEither = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): { readonly right: TValue } | { readonly left: TError } =>
  r.ok ? { right: r.value } : { left: r.error };

// Map result to a constant (useful in control-flow)
export const toConst = /* @__PURE__ */ <TValue, TError extends ErrorLike, TOut>(
  r: Result<TValue, TError>,
  onOk: TOut,
  onErr: TOut,
): TOut => (r.ok ? onOk : onErr);

// Convert Result to boolean flags as a tuple
export const toFlags = /* @__PURE__ */ <TValue, TError extends ErrorLike>(
  r: Result<TValue, TError>,
): readonly [isOk: boolean, isErr: boolean] => [r.ok, !r.ok] as const;
