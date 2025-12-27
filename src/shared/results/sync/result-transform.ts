import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Applies a transformation function to the value of a successful `Result`,
 * flattening the nested `Result` output into a single layer.
 *
 * @typeParam T - The type of the input value in the `Result`.
 * @typeParam U - The type of the output value after applying the transformation.
 * @typeParam E - The type of the original error in the `Result`, extending `AppError`.
 * @typeParam F - The type of the error that may arise during the transformation, extending `AppError`.
 *
 * @param fn - A function that transforms a `T` into a `Result<U, F>`.
 * @returns A function that accepts a `Result<T, E>` and returns a `Result<U, E | F>`,
 *          producing the transformed `Ok` value or propagating the first encountered `Err`.
 *
 * @example
 * const result = flatMap((v: number) => Ok(v * 2))(Ok(5)); // Ok(10)
 * const errorResult = flatMap((v: number) => Err({ code: 'E', message: 'fail' }))(Ok(5)); // Err
 */
export const flatMap =
  /* @__PURE__ */
    <T, U, E extends AppError, F extends AppError>(
      fn: (v: T) => Result<U, F>,
    ) =>
    /* @__PURE__ */
    (r: Result<T, E>): Result<U, E | F> =>
      r.ok ? fn(r.value) : Err(r.error);
