import type { Result } from "@/lib/core/result.base";

/**
 * Extracts the contained value from a `Result` object if the operation was successful.
 * Throws an error if the operation was unsuccessful.
 *
 * @typeParam T - The type of the value contained within a successful `Result`.
 * @typeParam E - The type of the error contained within an unsuccessful `Result`.
 *
 * @param r - The `Result` object from which to extract the value or throw an error.
 *   - `r.success`: A boolean indicating whether the operation was successful.
 *   - `r.data`: The value contained in a successful `Result`.
 *   - `r.error`: The error object contained in an unsuccessful `Result`.
 *
 * @returns The value of type `T` contained within the `Result` if successful.
 *
 * @throws The error of type `E` if the `Result` indicates failure.
 */

export const unwrap = <T, E>(r: Result<T, E>): T => {
  if (r.success) return r.data;
  throw r.error;
};

// Safe unwraps

/**
 * A utility function that provides a fallback value if a `Result` is not successful.
 *
 * @template T - The type of the successful `Result` data.
 * @template E - The type of the error in the `Result`.
 *
 * @param fallback - A default value of type `T` to return if the `Result` is not successful.
 * @returns A function that takes a `Result` of type `T` and `E`. If the `Result` is successful, it will return the contained value; otherwise, it will return the provided fallback value.
 */
export const unwrapOr =
  <T, E>(fallback: T) =>
  (r: Result<T, E>): T =>
    r.success ? r.data : fallback;

/**
 * A functional utility that takes a fallback function and returns a function
 * to extract the value from a `Result` type. If the `Result` is a success,
 * it returns the contained value; otherwise, it invokes the fallback function
 * with the error value and returns the result of that function.
 *
 * @template T - The type of the success value contained in the `Result`.
 * @template E - The type of the error value contained in the `Result`.
 *
 * @param fallback - A function that receives an error value of type `E` and
 * produces a fallback value of type `T` in case the `Result` is an error.
 *
 * @returns A function that takes a `Result` of type `Result<T, E>` and returns
 * the success value of type `T` if the `Result` is a success, or the fallback
 * value obtained by applying the `fallback` function to the error in case the
 * `Result` is a failure.
 */
export const unwrapOrElse =
  <T, E>(fallback: (e: E) => T) =>
  (r: Result<T, E>): T =>
    r.success ? r.data : fallback(r.error);

// Matching

/**
 * The `match` function processes a `Result` and returns a value based on whether
 * the `Result` is successful or contains an error.
 *
 * @param r - A `Result` instance containing either a success value or an error value.
 * @param onOk - A callback function executed when the `Result` is successful.
 * Receives the success value as its argument and returns a value of type `U`.
 * @param onErr - A callback function executed when the `Result` contains an error.
 * Receives the error value as its argument and returns a value of type `U`.
 * @returns Returns the value from the execution of either `onOk` or `onErr`, based on
 * whether the `Result` is a success or error.
 */
export const match = <T, E, U>(
  r: Result<T, E>,
  onOk: (v: T) => U,
  onErr: (e: E) => U,
): U => (r.success ? onOk(r.data) : onErr(r.error));

/**
 * Represents a function that applies a folding operation, which transforms or reduces a data structure
 * (such as an `Option` or a `Result`) into a single value based on pattern matching.
 *
 * It typically takes two functions or handlers for matching against possible cases (e.g., `Some` and `None` cases in an `Option`),
 * and returns a resulting value based on the specific match.
 *
 * Example use case:
 * - Folding over an `Option` to provide a default value if no value is present.
 * - Conditionally handling success or error cases in a computation.
 */
export const fold = match;
