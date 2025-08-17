import { Err, Ok, type Result } from "@/lib/core/result.base";

/**
 * Transforms the successful value of a `Result` using the provided mapping function, leaving the error value unchanged.
 *
 * This higher-order function takes a mapping function `fn` to apply to the data in a `Result` if it is successful.
 * If the `Result` contains an error, the error remains unchanged, and the mapping function is not applied.
 *
 * @typeParam T - The type of the successful value in the input `Result`.
 * @typeParam U - The type of the successful value in the transformed `Result`, as determined by the mapping function.
 * @typeParam E - The type of the error value in the `Result`, which remains unchanged.
 *
 * @param fn - A function that takes a value of type `T` and returns a value of type `U`. This function is used to transform the successful value in the `Result`.
 * @returns A function that takes a `Result<T, E>` and returns a new `Result<U, E>`:
 *          - If the input `Result` is a success (`Ok`), the successful value is passed through the mapping function `fn`, and the output is wrapped in an `Ok<U>`.
 *          - If the input `Result` is an error (`Err`), the same error is returned untouched.
 */
export const map =
  <T, U, E>(fn: (v: T) => U) =>
  (r: Result<T, E>): Result<U, E> =>
    r.success ? Ok(fn(r.data)) : r;

/**
 * Chains the transformation of a `Result` by applying a provided function to the
 * `success` value of the input `Result`. If the input `Result` is an error, it is
 * returned as is without invoking the function.
 *
 * @typeParam T - The type of the input `success` value in the incoming `Result`.
 * @typeParam U - The type of the `success` value in the resulting `Result`.
 * @typeParam E1 - The type of the error in the incoming `Result`.
 * @typeParam E2 - The type of the error in the resulting `Result` if the function returns an error.
 *
 * @param fn - A transformation function that takes a value of type `T` and returns a `Result<U, E2>`.
 * @returns A function that accepts a `Result<T, E1>` and returns a `Result<U, E1 | E2>`.
 *
 * @example
 * ```
 * const transform = chain<number, string, Error, TypeError>((v: number) => {
 *   return v > 0 ? ok(v.toString()) : err(new TypeError('Value must be positive'));
 * });
 *
 * const result = transform(ok(42)); // Produces: Result<string, Error | TypeError>
 * ```
 */
export const chain =
  <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
  (r: Result<T, E1>): Result<U, E1 | E2> =>
    r.success ? fn(r.data) : r;

/**
 * Represents a method or function used to chain multiple operations together in a sequential manner.
 * The `andThen` variable provides functionality to connect operations such that the output of one
 * operation serves as the input to the next, promoting a fluent and readable chaining mechanism.
 *
 * Alias: `chain`
 *
 * Use Cases:
 * - Chaining asynchronous or synchronous operations.
 * - Creating a pipeline of dependent transformations.
 * - Simplifying and organizing complex data flows by linearizing function calls.
 */
export const andThen = chain;

/**
 * Transforms the error part of a `Result` type using the provided mapping function.
 *
 * @template T - The type of the successful result value.
 * @template E1 - The type of the original error value.
 * @template E2 - The type of the transformed error value.
 *
 * @param fn - A function that takes an error of type `E1` and maps it to a new error of type `E2`.
 * @returns A function that takes a `Result` of either a success value of type `T` or an error of type `E1`
 *          and returns a new `Result` of either a success value of type `T` or an error of type `E2`.
 *
 * @remarks
 * This utility is useful for chaining or transforming error handling logic in functional programming contexts.
 * If the original `Result` is a success, it remains unaffected. If it is an error, the error is transformed
 * using the provided mapping function.
 */
export const mapError =
  <T, E1, E2>(fn: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<T, E2> =>
    r.success ? r : Err(fn(r.error));

/**
 * Transforms both the success and error variants of a `Result` using the provided mapping functions.
 *
 * The `bimap` function accepts two transformer functions: `onOk` to map the success value
 * and `onErr` to map the error value. It then applies the appropriate function based on
 * whether the input `Result` is a success or an error.
 *
 * @typeParam T - The type of the success value in the input `Result`.
 * @typeParam U - The type of the success value in the output `Result`.
 * @typeParam E1 - The type of the error value in the input `Result`.
 * @typeParam E2 - The type of the error value in the output `Result`.
 *
 * @param onOk - A function that transforms the success value of the `Result`.
 * @param onErr - A function that transforms the error value of the `Result`.
 *
 * @returns A function that takes a `Result` and returns a new `Result`
 * with the transformed success or error value.
 */
export const bimap =
  <T, U, E1, E2>(onOk: (v: T) => U, onErr: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<U, E2> =>
    r.success ? Ok(onOk(r.data)) : Err(onErr(r.error));
