// File: src/shared/core/result/result.ts
import type { BaseError } from "@/shared/errors/core/base-error";

/**
 * Freezes an object to prevent mutation (shallow).
 */
const freezeObject = <T extends object>(obj: T): Readonly<T> =>
  Object.freeze(obj);

/**
 * Represents a successful Result.
 */
export type OkResult<Tvalue> = { readonly ok: true; readonly value: Tvalue };

/**
 * Represents a failed Result.
 */
export type ErrResult<Terror extends BaseError> = {
  readonly ok: false;
  readonly error: Terror;
};

/**
 * Discriminated union for operation results.
 *
 * @typeParam Tvalue - The value type.
 * @typeParam Terror - The error type, must extend BaseError.
 */
export type Result<Tvalue, Terror extends BaseError> =
  | OkResult<Tvalue>
  | ErrResult<Terror>;

/**
 * Extracts the success type from a `Result` type.
 */
export type OkType<R> = R extends { ok: true; value: infer U } ? U : never;

/**
 * Extracts the error type from a `Result` type.
 */
export type ErrType<R> = R extends { ok: false; error: infer E } ? E : never;

/**
 * Creates a successful Result.
 */
export const Ok = /* @__PURE__ */ <Tvalue>(
  value: Tvalue,
): Result<Tvalue, never> => {
  const r = { ok: true as const, value } satisfies OkResult<Tvalue>;
  return freezeObject(r);
};

/**
 * Creates a failed Result.
 */
export const Err = /* @__PURE__ */ <Terror extends BaseError>(
  error: Terror,
): Result<never, Terror> => {
  const r = { error, ok: false as const } satisfies ErrResult<Terror>;
  return freezeObject(r);
};

/**
 * Type guard for OkResult.
 */
export const isOk = <Tvalue, Terror extends BaseError>(
  r: Result<Tvalue, Terror>,
): r is OkResult<Tvalue> => r.ok;

/**
 * Type guard for ErrResult.
 */
export const isErr = <Tvalue, Terror extends BaseError>(
  r: Result<Tvalue, Terror>,
): r is ErrResult<Terror> => !r.ok;

/**
 * Non-throwing unwrap to nullable.
 */
export const toNullable = /* @__PURE__ */ <Tvalue, Terror extends BaseError>(
  r: Result<Tvalue, Terror>,
): Tvalue | null => (r.ok ? r.value : null);

/**
 * Construct from a boolean condition, preserving the actual boolean.
 */
export const fromCondition = /* @__PURE__ */ <Terror extends BaseError>(
  condition: boolean,
  onFalse: () => Terror,
): Result<boolean, Terror> => (condition ? Ok(true) : Err(onFalse()));

/**
 * Convert Result to boolean flags as a tuple.
 */
export const toFlags = /* @__PURE__ */ <Tvalue, Terror extends BaseError>(
  r: Result<Tvalue, Terror>,
): readonly [isOk: boolean, isErr: boolean] => [r.ok, !r.ok] as const;
