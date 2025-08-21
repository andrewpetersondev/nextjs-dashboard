import "server-only";
import { Err, Ok, type Result } from "@/core/result-base";

/**
 * Transform the success value of a Result using a mapping function.
 *
 * Applies the provided function to the `success` branch of the given `Result<T, E>`.
 * If the result is an error, it is returned unchanged.
 *
 * @typeParam T - The type of the success value in the input result.
 * @typeParam U - The type of the success value in the mapped result.
 * @typeParam E - The type of the error value in both input and output results.
 * @param fn - Function to transform the success value.
 * @returns A function that accepts a `Result<T, E>`. It returns:
 * - `Result<U, E>` if the input is a success branch, with the success value transformed.
 * - `Result<T, E>` if the input is an error branch, unchanged.
 * @example
 * ```typescript
 * const convertToUpper = map<string, string, Error>((value) => value.toUpperCase());
 * const result1 = convertToUpper(Ok("hello"));
 * // result1: { success: true, data: "HELLO" }
 *
 * const result2 = convertToUpper(Err(new Error("Something wrong")));
 * // result2: { success: false, error: Error("Something wrong") }
 * ```
 * @remarks
 * This function does not mutate the input and produces a new instance for the `success` case.
 */
export const map =
  <T, U, E>(fn: (v: T) => U) =>
  (r: Result<T, E>): Result<U, E> =>
    r.success ? Ok(fn(r.data)) : r;

/**
 * Chain two computations in a result pipeline.
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
 * @example
 * ```typescript
 * const parseNumber = (v: string): Result<number, string> =>
 *   isNaN(Number(v)) ? { success: false, error: "Invalid number" } : { success: true, data: Number(v) };
 *
 * const toSquare = (n: number): Result<number, never> => ({ success: true, data: n * n });
 *
 * const pipeline = chain(toSquare);
 *
 * const result1 = pipeline(parseNumber("4")); // { success: true, data: 16 }
 * const result2 = pipeline(parseNumber("abc")); // { success: false, error: "Invalid number" }
 * ```
 * @remarks
 * - Preserves the original error if the input result is an error branch.
 * - Allocates a new result object only when mapping the success branch.
 */
export const chain =
  <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
  (r: Result<T, E1>): Result<U, E1 | E2> =>
    r.success ? fn(r.data) : r;

/**
 * Chain a computation on the success branch of a result.
 *
 * Transforms a `Result<T, E>` by applying a function to the success value of
 * `Ok`, producing a new `Result`. Does nothing on the error branch.
 *
 * @typeParam T - The type of the success value in the input result.
 * @typeParam E - The type of the error value in the input result.
 * @typeParam U - The type of the success value in the resulting result.
 * @param fn - Callback applied to the success value; returns `Result<U, E>`.
 * @returns A function that accepts a `Result<T, E>` and returns `Result<U, E>`.
 * @example
 * ```typescript
 * const result: Result<number, string> = ok(42);
 * const chained = andThen((n) => n > 0 ? ok(n * 2) : err('Negative'))(result);
 * console.log(chained); // Ok(84)
 * ```
 * @remarks
 * - No side effects; does not modify the original `Result`.
 * - Returns the error branch unchanged when the input is `Err`.
 */
export const andThen = chain;

/**
 * Map the error value of a `Result` to a new type.
 *
 * Applies the given transformation to the error if the result is an error branch;
 * leaves the success branch unchanged.
 *
 * @typeParam T - Type of the success value.
 * @typeParam E1 - Current error type of the `Result`.
 * @typeParam E2 - Transformed error type after mapping.
 * @param fn - Function to transform the error value.
 * @returns A new `Result<T, E2>` with the error transformed, or the original success unchanged.
 * @example
 * ```typescript
 * const original = Err<number, string>("network error");
 * const mapped = mapError((e) => `Handled: ${e}`)(original);
 * // mapped is Err<number, string> with error: "Handled: network error".
 * ```
 */
export const mapError =
  <T, E1, E2>(fn: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<T, E2> =>
    r.success ? r : Err(fn(r.error));

/**
 * Transform both success and error branches of a {@link Result}.
 *
 * Applies `onOk` to the success value and `onErr` to the error value, returning
 * a new `Result` with transformed branches.
 *
 * @typeParam T - Type of the input success value.
 * @typeParam U - Type of the transformed success value.
 * @typeParam E1 - Type of the input error value.
 * @typeParam E2 - Type of the transformed error value.
 * @param onOk - Function to transform the success value.
 * @param onErr - Function to transform the error value.
 * @returns A function that takes a `Result<T, E1>` and returns a `Result<U, E2>`.
 * @example
 * ```typescript
 * const result: Result<number, string> = Ok(42);
 * const transformed = bimap(
 *   (v) => v * 2,
 *   (e) => `Error: ${e}`
 * )(result);
 * // transformed: Result<number, string> with success value 84.
 * ```
 */
export const bimap =
  <T, U, E1, E2>(onOk: (v: T) => U, onErr: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<U, E2> =>
    r.success ? Ok(onOk(r.data)) : Err(onErr(r.error));
