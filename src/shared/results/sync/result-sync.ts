import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Executes a synchronous function and converts thrown values into a mapped `Err`.
 *
 * @typeParam Tv - The return value type of the function.
 * @typeParam Te - The error type produced by `mapError`, must extend `AppError`.
 * @param fn - The function to execute.
 * @param mapError - A callback that maps any thrown value to a `Te` error.
 * @returns A `Result<Tv, Te>` which is `Ok` with the function return value or `Err` with the mapped error.
 * @example
 * const res = tryCatch(() => compute(), (e) => ({ code: 'ERR', message: String(e) }));
 */
export function tryCatch<Tv, Te extends AppError>(
  fn: () => Tv,
  mapError: (e: unknown) => Te,
): Result<Tv, Te> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Constructs a `Result` from a nullable value.
 *
 * @typeParam Tv - The expected non-null value type.
 * @typeParam Te - The error type produced by `onNull`, must extend `AppError`.
 * @param v - The value that may be `null` or `undefined`.
 * @param onNull - A callback that produces a `Te` error when `v` is `null` or `undefined`.
 * @returns `Ok(v)` when `v` is non-null/undefined, otherwise `Err(onNull())`.
 * @example
 * const res = fromNullable(value, () => ({ code: 'MISSING', message: 'value missing' }));
 */
export const fromNullable = <Tv, Te extends AppError>(
  v: Tv | null | undefined,
  onNull: () => Te,
  // biome-ignore lint/nursery/noEqualsToNull: fix
): Result<Tv, Te> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Builds a `Result` by testing a value against a predicate.
 *
 * @typeParam Tv - The input value type.
 * @typeParam Te - The error type produced by `onFail`, must extend `AppError`.
 * @param value - The value to validate with `predicate`.
 * @param predicate - A function that returns `true` when the value satisfies the condition.
 * @param onFail - A function that produces a `Te` error when the predicate returns `false`.
 * @returns `Ok(value)` if `predicate(value)` is `true`, otherwise `Err(onFail(value))`.
 */
export const fromPredicate = <Tv, Te extends AppError>(
  value: Tv,
  predicate: (v: Tv) => boolean,
  onFail: (v: Tv) => Te,
): Result<Tv, Te> => (predicate(value) ? Ok(value) : Err(onFail(value)));

/**
 * Guard-based variant of `fromPredicate` that narrows the value type when the guard passes.
 *
 * @typeParam Ti - The input value type.
 * @typeParam To - The narrowed output type when `guard` returns `true`; must extend `Ti`.
 * @typeParam Te - The error type produced by `onFail`, must extend `AppError`.
 * @param value - The value to test with the type guard.
 * @param guard - A type guard that asserts `value` is `To`.
 * @param onFail - A function that produces a `Te` error when the guard fails.
 * @returns `Ok(value)` typed as `To` when the guard passes, otherwise `Err(onFail(value))`.
 * @example
 * const res = fromGuard<unknown, string, AppError>(val, (v): v is string => typeof v === 'string', v => ({ code: 'TYPE', message: 'not a string' }));
 */
export const fromGuard = /* @__PURE__ */ <
  Ti,
  To extends Ti,
  Te extends AppError,
>(
  value: Ti,
  guard: (v: Ti) => v is To,
  onFail: (v: Ti) => Te,
): Result<To, Te> => (guard(value) ? Ok(value) : Err(onFail(value)));
