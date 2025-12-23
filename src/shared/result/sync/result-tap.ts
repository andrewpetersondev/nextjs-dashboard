import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Executes a provided function if the `Result` is successful (`ok`), passing its value.
 * Returns the original `Result` unchanged.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The error type in the result, extending `AppError`.
 * @param fn - Function invoked with the success value for side effects.
 * @returns A function that accepts a `Result<Tv, Te>` and returns the same `Result`.
 */
export const tapOk =
  /* @__PURE__ */
    <Tv, Te extends AppError>(fn: (v: Tv) => void) =>
    (r: Result<Tv, Te>): Result<Tv, Te> => {
      if (r.ok) {
        fn(r.value);
      }
      return r;
    };

/**
 * Applies a side-effect function to the error of a `Result` if it is not ok.
 * Returns the original `Result` unchanged.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The error type in the result, extending `AppError`.
 * @param fn - Function invoked with the error for side effects.
 * @returns A function that accepts a `Result<Tv, Te>` and returns the same `Result`.
 * @example
 * const result = tapError((err) => console.error(err))(someResult);
 */
export const tapError =
  /* @__PURE__ */
    <Tv, Te extends AppError>(fn: (e: Te) => void) =>
    (r: Result<Tv, Te>): Result<Tv, Te> => {
      if (!r.ok) {
        fn(r.error);
      }
      return r;
    };

/**
 * Safely applies a given side-effect function to the success value of a `Result`.
 * If the side-effect throws, the thrown value is mapped to a `Ts` error and returned as `Err`.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The original error type in the result, extending `AppError`.
 * @typeParam Ts - The side-effect error type produced by `mapError`, extending `AppError`.
 * @param fn - Side-effect function to run when the `Result` is `Ok`.
 * @param mapError - Function that maps an unknown thrown value to a `Ts`.
 * @returns A function that accepts a `Result<Tv, Te>` and returns `Result<Tv, Te | Ts>`.
 */
export function tapOkSafe<Tv, Te extends AppError, Ts extends AppError>(
  fn: (v: Tv) => void,
  mapError: (e: unknown) => Ts,
): (r: Result<Tv, Te>) => Result<Tv, Te | Ts>;

/**
 * Implementation of `tapOkSafe`.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The original error type in the result.
 * @typeParam Ts - The side-effect error type.
 * @param fn - Side-effect function for success values.
 * @param mapError - Mapper for thrown values to `Ts`.
 * @returns Function that safely applies `fn` and returns the original or an `Err` with the side error.
 */
export function tapOkSafe<Tv, Te extends AppError, Ts extends AppError>(
  fn: (v: Tv) => void,
  mapError: (e: unknown) => Ts,
) {
  return /* @__PURE__ */ (r: Result<Tv, Te>): Result<Tv, Te | Ts> => {
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
 * Safely taps into the error of a `Result`, applying a function and mapping any thrown values
 * to a side-effect error.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The original error type in the result, extending `AppError`.
 * @typeParam Ts - The side-effect error type produced by `mapError`, extending `AppError`.
 * @param fn - Side-effect function invoked when the `Result` is `Err`.
 * @param mapError - Function that maps an unknown thrown value to a `Ts`.
 * @returns A function that accepts a `Result<Tv, Te>` and returns `Result<Tv, Te | Ts>`.
 */
export function tapErrorSafe<Tv, Te extends AppError, Ts extends AppError>(
  fn: (e: Te) => void,
  mapError: (e: unknown) => Ts,
): (r: Result<Tv, Te>) => Result<Tv, Te | Ts>;

/**
 * Implementation of `tapErrorSafe`.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The original error type.
 * @typeParam Ts - The side-effect error type.
 * @param fn - Function to handle the original error for side effects.
 * @param mapError - Mapper for thrown values to `Ts`.
 * @returns Function that safely applies `fn` to the error and returns the original or an `Err` with the side error.
 */
export function tapErrorSafe<Tv, Te extends AppError, Ts extends AppError>(
  fn: (e: Te) => void,
  mapError: (e: unknown) => Ts,
) {
  return /* @__PURE__ */ (r: Result<Tv, Te>): Result<Tv, Te | Ts> => {
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
