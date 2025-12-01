import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Executes a provided function if the `Result` is successful (`ok`), passing its value.
 * Returns the original `Result` regardless of its state.
 *
 * @public
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the error in the result, extending `AppError`.
 * @param fn - The function to execute if the result is successful.
 * @returns The original `Result` instance.
 */
export const tapOk =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(fn: (v: Tvalue) => void) =>
    (r: Result<Tvalue, Terror>): Result<Tvalue, Terror> => {
      if (r.ok) {
        fn(r.value);
      }
      return r;
    };

/**
 * Applies a side-effect function to the error of a `Result` if it is not ok.
 *
 * @typeParam Tvalue - The type of the success value.
 * @typeParam Terror - The type of the error, extending `AppError`.
 * @param fn - A function to handle the error.
 * @returns The original `Result` after applying the side-effect.
 * @example
 * const result = tapError(error => console.log(error))(someResult);
 */
export const tapError =
  /* @__PURE__ */
    <Tvalue, Terror extends AppError>(fn: (e: Terror) => void) =>
    (r: Result<Tvalue, Terror>): Result<Tvalue, Terror> => {
      if (!r.ok) {
        fn(r.error);
      }
      return r;
    };

/**
 * Safely applies a given function to the success value of a Result.
 *
 * @param fn - A callback function to process the success value.
 * @param mapError - Function to transform unknown errors into a `Tsideerror`.
 * @returns A function that operates on a Result and preserves its type while handling potential errors.
 */
export function tapOkSafe<
  Tvalue,
  Terror extends AppError,
  Tsideerror extends AppError,
>(
  fn: (v: Tvalue) => void,
  mapError: (e: unknown) => Tsideerror,
): (r: Result<Tvalue, Terror>) => Result<Tvalue, Terror | Tsideerror>;

/**
 * A function to safely process a `Result` value and handle side effects.
 *
 * @param fn - Function called with the successful value of the `Result`.
 * @param mapError - Mapping function to transform unknown errors.
 * @returns A transformed `Result` preserving the original or including the side-effect error.
 */
export function tapOkSafe<
  Tvalue,
  Terror extends AppError,
  Tsideerror extends AppError,
>(fn: (v: Tvalue) => void, mapError: (e: unknown) => Tsideerror) {
  return /* @__PURE__ */ (
    r: Result<Tvalue, Terror>,
  ): Result<Tvalue, Terror | Tsideerror> => {
    if (r.ok) {
      try {
        fn(r.value);
      } catch (e) {
        const sideErr = mapError(e);
        return Err(sideErr);
      }
    }
    return r;
  };
}

/**
 * Safely taps into the error of a `Result` object, applying a function to it and handling potential exceptions.
 *
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the error, extends `AppError`.
 * @param fn - Callback function to process the error.
 * @param mapError - Function to transform unknown errors into a `Tsideerror`.
 * @returns A new `Result` containing the original value or a transformed error.
 */
export function tapErrorSafe<
  Tvalue,
  Terror extends AppError,
  Tsideerror extends AppError,
>(
  fn: (e: Terror) => void,
  mapError: (e: unknown) => Tsideerror,
): (r: Result<Tvalue, Terror>) => Result<Tvalue, Terror | Tsideerror>;

/**
 * Safely executes a function on an error and maps unknown errors to a specific type.
 *
 * @typeParam Tvalue - The type of the successful result value.
 * @typeParam Terror - The type of the primary error in the result.
 * @typeParam Tsideerror - The type of the fallback error.
 * @param fn - A function to handle the primary error.
 * @param mapError - A function to map unknown errors to `Tsideerror`.
 * @returns A wrapped Result, potentially transformed with a side error if mapping occurs.
 */
export function tapErrorSafe<
  Tvalue,
  Terror extends AppError,
  Tsideerror extends AppError,
>(fn: (e: Terror) => void, mapError: (e: unknown) => Tsideerror) {
  return /* @__PURE__ */ (
    r: Result<Tvalue, Terror>,
  ): Result<Tvalue, Terror | Tsideerror> => {
    if (!r.ok) {
      try {
        fn(r.error);
      } catch (e) {
        const sideErr = mapError(e);
        return Err(sideErr);
      }
    }
    return r;
  };
}
