import { Err, Ok } from "@/shared/application/result/result";
import type { Result } from "@/shared/application/result/result.types";
import type { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Executes a function and catches any thrown errors, mapping them to a specified error type.
 *
 * @typeParam Tvalue - The type of the value returned by the function.
 * @typeParam Terror - The type of the error returned by the mapping function.
 * @param fn - The function to execute.
 * @param mapError - A callback to convert thrown errors into a specific error type.
 * @returns A `Result` object containing either the value or the mapped error.
 */
export function tryCatch<Tvalue, Terror extends AppError>(
  fn: () => Tvalue,
  mapError: (e: unknown) => Terror,
): Result<Tvalue, Terror> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Creates a `Result` object from a potentially nullable value.
 *
 * @typeParam Tvalue - The type of the expected value.
 * @typeParam Terror - The type of error to return, extending `AppError`.
 * @param v - The value which may be `null` or `undefined`.
 * @param onNull - A callback that returns an error when the value is `null` or `undefined`.
 * @returns A `Result` containing a value if `v` is non-null, otherwise an error.
 * @example
 * const result = fromNullable(value, () => new AppError('Value is null or undefined'));
 */
export const fromNullable = <Tvalue, Terror extends AppError>(
  v: Tvalue | null | undefined,
  onNull: () => Terror,
): Result<Tvalue, Terror> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Creates a `Result` based on the evaluation of a predicate function.
 *
 * @typeParam Tvalue - The type of the input value to evaluate.
 * @typeParam Terror - The type of the error to return.
 * @param value - The value to be checked against the predicate.
 * @param predicate - A function that returns `true` if the value satisfies a condition.
 * @param onFail - A function that generates an error when the predicate fails.
 * @returns A `Result` containing the value if the predicate passes, or an error otherwise.
 */
export const fromPredicate = <Tvalue, Terror extends AppError>(
  value: Tvalue,
  predicate: (v: Tvalue) => boolean,
  onFail: (v: Tvalue) => Terror,
): Result<Tvalue, Terror> =>
  predicate(value) ? Ok(value) : Err(onFail(value));

// Guard-based variant
export const fromGuard = /* @__PURE__ */ <
  Tin,
  Tout extends Tin,
  Terror extends AppError,
>(
  value: Tin,
  guard: (v: Tin) => v is Tout,
  onFail: (v: Tin) => Terror,
): Result<Tout, Terror> => (guard(value) ? Ok(value) : Err(onFail(value)));
