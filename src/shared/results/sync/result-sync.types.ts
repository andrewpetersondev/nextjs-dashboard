import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * A utility type for applying a transformation function to a successful `Result` value.
 *
 * @typeParam T - The type of the input value in the `Result`.
 * @typeParam U - The type of the transformed value.
 * @typeParam E - The type of the error, defaults to `AppError`.
 *
 * @param fn - A transformation function to apply to the `T` value.
 * @returns A function that accepts a `Result<T, E>` and returns a `Result<U, E>`.
 */
export type MapOk = <T, U, E extends AppError>(
  fn: (v: T) => U,
) => (r: Result<T, E>) => Result<U, E>;

/**
 * Transforms the error type of a `Result` using a mapping function.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type, constrained to `AppError`.
 * @typeParam E2 - The mapped error type, constrained to `AppError`.
 * @param fn - A function that maps from `E1` to `E2`.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E2>`.
 */
export type MapError = <T, E1 extends AppError, E2 extends AppError>(
  fn: (e: E1) => E2,
) => (r: Result<T, E1>) => Result<T, E2>;

/**
 * Transforms both success and error states of a `Result` type using the provided functions.
 *
 * @typeParam T - The input success value type.
 * @typeParam U - The output success value type.
 * @typeParam E1 - The input error type, extending `AppError`.
 * @typeParam E2 - The output error type, extending `AppError`.
 * @param onOk - A function to transform the success value.
 * @param onErr - A function to transform the error value.
 * @returns A function that maps a `Result<T, E1>` to `Result<U, E2>`.
 */
export type MapBoth = <T, U, E1 extends AppError, E2 extends AppError>(
  onOk: (v: T) => U,
  onErr: (e: E1) => E2,
) => (r: Result<T, E1>) => Result<U, E2>;
