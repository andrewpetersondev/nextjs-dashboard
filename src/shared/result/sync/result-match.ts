import type { AppError } from "@/shared/errors/core/app-error";
import type { Result } from "@/shared/result/result.types";

/**
 * Extracts the value from a successful `Result` or throws the associated error if unsuccessful.
 *
 * @typeParam T - The type of the value in case of success.
 * @typeParam E - The type of the error, extending `AppError`.
 * @param r - A `Result` object containing either a success value or an error.
 * @returns The contained value of type `T` when `r.ok` is true.
 * @throws The error of type `E` when `r.ok` is false.
 */
export const unwrapOrThrow = <T, E extends AppError>(r: Result<T, E>): T => {
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Returns the value from a `Result` if `ok`, otherwise returns the provided fallback.
 *
 * @typeParam T - The type of the successful result value.
 * @typeParam E - The type of the error, extending `AppError`.
 * @param fallback - The default value to return if the `Result` is not `ok`.
 * @returns A function that accepts a `Result<T, E>` and returns `T` or the `fallback`.
 * @example
 * const valueOr42 = unwrapOr(42);
 * const result = valueOr42(someResult);
 */
export const unwrapOr =
  /* @__PURE__ */
    <T, E extends AppError>(fallback: T) =>
    /* @__PURE__ */
    (r: Result<T, E>): T =>
      r.ok ? r.value : fallback;

/**
 * Returns the value of a successful `Result` or computes a fallback value using the provided function.
 *
 * @typeParam T - The type of the successful value contained in the `Result`.
 * @typeParam E - The type of the error contained in the `Result`, extending `AppError`.
 * @param fallback - A function that computes a fallback value from the error `E`.
 * @returns A function that accepts a `Result<T, E>` and returns `T` either from the result or computed via `fallback`.
 * @example
 * const valueFromErr = unwrapOrElse((err) => defaultValue);
 * const result = valueFromErr(someResult);
 */
export const unwrapOrElse =
  /* @__PURE__ */
    <T, E extends AppError>(fallback: (e: E) => T) =>
    /* @__PURE__ */
    (r: Result<T, E>): T =>
      r.ok ? r.value : fallback(r.error);

/**
 * Matches a `Result` and applies the appropriate callback based on its state.
 *
 * @typeParam T - The type of the successful result's value.
 * @typeParam E - The type of the error, extending `AppError`.
 * @typeParam O - The return type of the callback functions.
 * @param r - The `Result` object to match.
 * @param onOk - Callback invoked with the value when `r` is `Ok`.
 * @param onErr - Callback invoked with the error when `r` is `Err`.
 * @returns The return value of either `onOk` or `onErr`.
 * @example
 * const message = matchResult(result, v => `Value: ${v}`, e => `Error: ${e.message}`);
 */
export const matchResult = /* @__PURE__ */ <T, E extends AppError, O>(
  r: Result<T, E>,
  onOk: (v: T) => O,
  onErr: (e: E) => O,
): O => (r.ok ? onOk(r.value) : onErr(r.error));

/**
 * Exhaustive match that returns a constant output based on the `Result` state.
 *
 * @typeParam T - The type of the successful result's value.
 * @typeParam E - The type of the error, extending `AppError`.
 * @typeParam O - The constant output type for both branches.
 * @param onOk - Constant value to return when `r` is `Ok`.
 * @param onErr - Constant value to return when `r` is `Err`.
 * @returns A function that accepts a `Result<T, E>` and returns either `onOk` or `onErr`.
 * @example
 * const toBool = matchTo(true, false);
 * const flag = toBool(result);
 */
export const matchTo =
  /* @__PURE__ */
    <T, E extends AppError, O>(onOk: O, onErr: O) =>
    (r: Result<T, E>): O =>
      r.ok ? onOk : onErr;
