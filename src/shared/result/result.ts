import type { AppError } from "@/shared/errors/core/app-error.class";
import type { ErrResult, OkResult, Result } from "@/shared/result/result.types";

/**
 * Freezes an object to prevent mutation (shallow).
 */
const freezeObject = <T extends object>(obj: T): Readonly<T> =>
  Object.freeze(obj);

/**
 * Creates a successful Result.
 */
export const Ok = /* @__PURE__ */ <T>(value: T): Result<T, never> => {
  const r = { ok: true as const, value } satisfies OkResult<T>;
  return freezeObject(r);
};

/**
 * Creates a failed Result.
 */
export const Err = /* @__PURE__ */ <E extends AppError>(
  error: E,
): Result<never, E> => {
  const r = { error, ok: false as const } satisfies ErrResult<E>;
  return freezeObject(r);
};

/**
 * Type guard for OkResult.
 */
export const isOk = <T, E extends AppError>(
  r: Result<T, E>,
): r is OkResult<T> => r.ok;

/**
 * Type guard for ErrResult.
 */
export const isErr = <T, E extends AppError>(
  r: Result<T, E>,
): r is ErrResult<E> => !r.ok;

/**
 * Non-throwing unwrap to nullable.
 */
export const toNullable = /* @__PURE__ */ <T, E extends AppError>(
  r: Result<T, E>,
): T | null => (r.ok ? r.value : null);

/**
 * Construct from a boolean condition, preserving the actual boolean.
 */
export const fromCondition = /* @__PURE__ */ <E extends AppError>(
  condition: boolean,
  onFalse: () => E,
): Result<boolean, E> => (condition ? Ok(true) : Err(onFalse()));

/**
 * Convert Result to boolean flags as a tuple.
 */
export const toFlags = /* @__PURE__ */ <T, E extends AppError>(
  r: Result<T, E>,
): readonly [isOk: boolean, isErr: boolean] => [r.ok, !r.ok] as const;
