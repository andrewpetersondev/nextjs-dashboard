import type { Result } from "@/shared/core/result/result";

/**
 * Chain two computations in a result pipeline.
 *
 * Branch semantics: On Ok, calls fn(data) and returns its Result. On Err, returns the same Err unchanged.
 *
 * Applies the provided function to the success branch of the input result and
 * forwards the result, preserving the error branch if present.
 *
 * @typeParam T - Type of the input success value.
 * @typeParam U - Type of the output success value.
 * @typeParam E1 - Type of the initial error value.
 * @typeParam E2 - Type of the error value from the chained function.
 * @param fn - A function mapping a success value of type `T` to a `Result<U, E2>`.
 * @returns A `Result<U, E1 | E2>` representing the chained computation.
 * @remarks
 * - Preserves the original error if the input result is an error branch.
 * - Allocates a new result object only when mapping the success branch.
 */
export const flatMap =
  <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
  (r: Result<T, E1>): Result<U, E1 | E2> =>
    r.success ? fn(r.data) : r;

/**
 * @alias flatMap
 */
export const andThen = flatMap;
