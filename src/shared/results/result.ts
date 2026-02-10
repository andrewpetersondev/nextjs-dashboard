import type { AppError } from "@/shared/errors/core/app-error.entity";
import type {
  ErrResult,
  OkResult,
  Result,
} from "@/shared/results/result.types";

/**
 * Freezes an object to prevent mutation (shallow).
 *
 * @typeParam TObject - The object type to freeze.
 * @param obj - The object to freeze.
 * @returns A shallowly frozen `Readonly<TObject>` instance of the input object.
 * @remarks add a short note that freezeObject is shallow to set expectations for nested data.
 * @example
 * const obj = { a: 1 };
 * const frozen = freezeObject(obj);
 * // frozen.a === 1
 */
function freezeObject<TObject extends object>(obj: TObject): Readonly<TObject> {
  return Object.freeze(obj);
}

/**
 * Creates a successful Result wrapper.
 *
 * @typeParam TValue - The success value type.
 * @param value - The value to wrap as an `Ok` result.
 * @returns A frozen `Result<TValue, never>` representing success.
 * @example
 * const result = Ok(42);
 * // result.ok === true
 * // result.value === 42
 */
export function Ok<TValue>(value: TValue): Result<TValue, never> {
  const r = { ok: true as const, value } satisfies OkResult<TValue>;
  return freezeObject(r);
}

/**
 * Creates a failed Result wrapper.
 *
 * @typeParam TError - The error type, constrained to `AppError`.
 * @param error - The error payload to wrap as an `Err` result.
 * @returns A frozen `Result<never, TError>` representing failure.
 * @example
 * const error = { code: 'ERR', message: 'Failed' };
 * const result = Err(error);
 * // result.ok === false
 * // result.error === error
 */
export function Err<TError extends AppError>(
  error: TError,
): Result<never, TError> {
  const r = { error, ok: false as const } satisfies ErrResult<TError>;
  return freezeObject(r);
}

/**
 * Type guard that narrows a `Result` to an `OkResult`.
 *
 * @typeParam TValue - The success value type.
 * @typeParam TError - The error type, constrained to `AppError`.
 * @param r - The `Result` to test.
 * @returns `true` if `r` is an `OkResult`, otherwise `false`.
 * @example
 * if (isOk(result)) {
 *   // result.value is available
 * }
 */
export function isOk<TValue, TError extends AppError>(
  r: Result<TValue, TError>,
): r is OkResult<TValue> {
  return r.ok;
}

/**
 * Type guard that narrows a `Result` to an `ErrResult`.
 *
 * @typeParam TValue - The success value type.
 * @typeParam TError - The error type, constrained to `AppError`.
 * @param r - The `Result` to test.
 * @returns `true` if `r` is an `ErrResult`, otherwise `false`.
 * @example
 * if (isErr(result)) {
 *   // result.error is available
 * }
 */
export function isErr<TValue, TError extends AppError>(
  r: Result<TValue, TError>,
): r is ErrResult<TError> {
  return !r.ok;
}

/**
 * Non-throwing unwrap to nullable value.
 *
 * @typeParam TValue - The success value type.
 * @typeParam TError - The error type, constrained to `AppError`.
 * @param r - The `Result` to unwrap.
 * @returns The contained value when `Ok`, otherwise `null`.
 * @example
 * const value = unwrapOrNull(result);
 * // value is TValue or null
 */
export function unwrapOrNull<TValue, TError extends AppError>(
  r: Result<TValue, TError>,
): TValue | null {
  return r.ok ? r.value : null;
}

/**
 * Convert a `Result` to boolean flags as a tuple.
 *
 * @typeParam TValue - The success value type.
 * @typeParam TError - The error type, constrained to `AppError`.
 * @param r - The `Result` to convert.
 * @returns A readonly tuple `[isOk, isErr]`.
 * @example
 * const [ok, err] = toFlags(result);
 * // ok is true if result is Ok, false otherwise
 * // err is true if result is Err, false otherwise
 */
export function toFlags<TValue, TError extends AppError>(
  r: Result<TValue, TError>,
): readonly [isOk: boolean, isErr: boolean] {
  return [r.ok, !r.ok] as const;
}
