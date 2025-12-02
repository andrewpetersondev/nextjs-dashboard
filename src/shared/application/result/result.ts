import type {
  ErrResult,
  OkResult,
  Result,
} from "@/shared/application/result/result.types";
import type { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Freezes an object to prevent mutation (shallow).
 *
 * @example
 * const obj = { a: 1 };
 * const frozen = freezeObject(obj);
 * // frozen.a === 1
 */
const freezeObject = <T extends object>(obj: T): Readonly<T> =>
  Object.freeze(obj);

/**
 * Creates a successful Result.
 *
 * @example
 * const result = Ok(42);
 * // result.ok === true
 * // result.value === 42
 */
export const Ok = /* @__PURE__ */ <T>(value: T): Result<T, never> => {
  const r = { ok: true as const, value } satisfies OkResult<T>;
  return freezeObject(r);
};

/**
 * Creates a failed Result.
 *
 * @example
 * const error = { code: 'ERR', message: 'Failed' };
 * const result = Err(error);
 * // result.ok === false
 * // result.error === error
 */
export const Err = /* @__PURE__ */ <E extends AppError>(
  error: E,
): Result<never, E> => {
  const r = { error, ok: false as const } satisfies ErrResult<E>;
  return freezeObject(r);
};

/**
 * Type guard for OkResult.
 *
 * @example
 * if (isOk(result)) {
 *   // result.value is available
 * }
 */
export const isOk = <T, E extends AppError>(
  r: Result<T, E>,
): r is OkResult<T> => r.ok;

/**
 * Type guard for ErrResult.
 *
 * @example
 * if (isErr(result)) {
 *   // result.error is available
 * }
 */
export const isErr = <T, E extends AppError>(
  r: Result<T, E>,
): r is ErrResult<E> => !r.ok;

/**
 * Non-throwing unwrap to nullable.
 *
 * @example
 * const value = toNullable(result);
 * // value is T or null
 */
export const toNullable = /* @__PURE__ */ <T, E extends AppError>(
  r: Result<T, E>,
): T | null => (r.ok ? r.value : null);

/**
 * Construct from a boolean condition, preserving the actual boolean.
 *
 * @example
 * const result = fromCondition(isValid, () => ({ code: 'INVALID', message: 'Not valid' }));
 */
export const fromCondition = /* @__PURE__ */ <E extends AppError>(
  condition: boolean,
  onFalse: () => E,
): Result<boolean, E> => (condition ? Ok(true) : Err(onFalse()));

/**
 * Convert Result to boolean flags as a tuple.
 *
 * @example
 * const [ok, err] = toFlags(result);
 * // ok is true if result is Ok, false otherwise
 * // err is true if result is Err, false otherwise
 */
export const toFlags = /* @__PURE__ */ <T, E extends AppError>(
  r: Result<T, E>,
): readonly [isOk: boolean, isErr: boolean] => [r.ok, !r.ok] as const;
