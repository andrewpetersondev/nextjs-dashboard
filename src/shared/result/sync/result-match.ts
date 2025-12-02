import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

/**
 * Extracts the value from a successful `Result` or throws the associated error if unsuccessful.
 *
 * @typeParam Tvalue - The type of the value in case of success.
 * @typeParam Terror - The type of the error, extending `AppError`.
 * @param r - A `Result` object containing either a success value or an error.
 * @returns The value of type `Tvalue` if the result is successful.
 * @throws The error of type `Terror` if the result is unsuccessful.
 */
export const unwrapOrThrow = <Tvalue, Terror extends AppError>(
  r: Result<Tvalue, Terror>,
): Tvalue => {
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Returns the value from a `Result` if `ok`, otherwise returns the provided fallback.
 *
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the error, extending `AppError`.
 * @param fallback - The default value to return if the `Result` is not `ok`.
 * @returns The value from the `Result` or the fallback value.
 * @example
 * const result = unwrapOr(42)(someResult);
 */
export const unwrapOr =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(fallback: Tvalue) =>
    /* @__PURE__ */
    (r: Result<Tvalue, Terror>): Tvalue =>
      r.ok ? r.value : fallback;

/**
 * Returns the value of a successful `Result` or computes a fallback value using the provided function.
 *
 * @typeParam Tvalue - The type of the successful value contained in the `Result`.
 * @typeParam Terror - The type of the error contained in the `Result`, extending `AppError`.
 * @param fallback - A function that computes a fallback value based on the `Terror`.
 * @returns The value if the `Result` is successful, otherwise the value returned by the `fallback` function.
 * @example
 * ```ts
 * const result = unwrapOrElse((error) => defaultValue)(someResult);
 * ```
 */
export const unwrapOrElse =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(fallback: (e: Terror) => Tvalue) =>
    /* @__PURE__ */
    (r: Result<Tvalue, Terror>): Tvalue =>
      r.ok ? r.value : fallback(r.error);

/**
 * Matches a `Result` and applies the appropriate callback based on its state.
 *
 * @typeParam Tvalue - The type of the successful result's value.
 * @typeParam Terror - The type of the error, extending `AppError`.
 * @typeParam Tout - The return type of the callback functions.
 * @param r - The `Result` object to match.
 * @param onOk - Callback invoked with the value if `r` is successful.
 * @param onErr - Callback invoked with the error if `r` is an error.
 * @returns The result of the invoked callback.
 * @example
 * const result = Result.ok(42);
 * const message = matchResult(result, value => `Value is ${value}`, err => `Error: ${err.message}`);
 */
export const matchResult = /* @__PURE__ */ <
  Tvalue,
  Terror extends AppError,
  Tout,
>(
  r: Result<Tvalue, Terror>,
  onOk: (v: Tvalue) => Tout,
  onErr: (e: Terror) => Tout,
): Tout => (r.ok ? onOk(r.value) : onErr(r.error));

// Exhaustive match with constant outputs
export const matchTo =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError, Tout>(onOk: Tout, onErr: Tout) =>
    (r: Result<Tvalue, Terror>): Tout =>
      r.ok ? onOk : onErr;
