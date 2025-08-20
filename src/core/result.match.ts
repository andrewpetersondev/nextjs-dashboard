import "server-only";
import type { Result } from "@/core/result.base";

/**
 * Extract the success value from a {@link Result}, or throw on error.
 *
 * If the result contains a success, the contained value is returned. Otherwise,
 * the function throws the associated error.
 *
 * @typeParam T - The success type of the result.
 * @typeParam E - The error type of the result.
 * @param r - The {@link Result} to unwrap; must be a success, or it will throw.
 * @returns The success value of the result.
 * @throws Throws the error value if the result is an error.
 * @example
 * ```typescript
 * const success = { success: true, data: 42 };
 * const error = { success: false, error: new Error("Failure") };
 *
 * console.log(unwrap(success)); // 42
 * console.log(unwrap(error));   // Throws: Error: Failure
 * ```
 */
export const unwrap = <T, E>(r: Result<T, E>): T => {
  if (r.success) return r.data;
  throw r.error;
};

/**
 * Provide a fallback value for an error result.
 *
 * @typeParam T - The type of the value contained in the success branch.
 * @typeParam E - The type of the value contained in the error branch.
 * @param fallback - A value of type T to return if the result is an error.
 * @returns A function that takes a `Result<T, E>` and returns the success value or the fallback.
 * @example
 * ```typescript
 * const result: Result<number, string> = { success: false, error: "Not found" };
 * const value = unwrapOr(42)(result); // 42
 * ```
 */
export const unwrapOr =
  <T, E>(fallback: T) =>
  (r: Result<T, E>): T =>
    r.success ? r.data : fallback;

/**
 * Provide a fallback value for a failed result.
 *
 * Returns the successful value if present, otherwise applies the fallback.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error value type.
 * @param fallback - A function that maps the error value `e` to a fallback success value `T`.
 * @returns A function that takes a `Result<T, E>` and returns either the success value or the fallback value.
 * @example
 * ```typescript
 * const result: Result<number, string> = { success: false, error: "Error" };
 * const fallback = (e: string) => 42;
 *
 * const unwrap = unwrapOrElse(fallback);
 * console.log(unwrap(result)); // 42
 * ```
 */
export const unwrapOrElse =
  <T, E>(fallback: (e: E) => T) =>
  (r: Result<T, E>): T =>
    r.success ? r.data : fallback(r.error);

/**
 * Pattern-match on a Result<T, E>.
 *
 * Calls `onOk` if the result is a success or `onErr` if it's an error.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error value type.
 * @typeParam U - The return type of the callbacks.
 * @param r - The Result to match on.
 * @param onOk - Callback invoked with the success value if `r` is a success.
 * @param onErr - Callback invoked with the error value if `r` is an error.
 * @returns The return value of either `onOk` or `onErr`.
 * @example
 * ```typescript
 * const result: Result<number, string> = { success: true, data: 42 };
 * const message = match(
 *   result,
 *   (value) => `Success with value: ${value}`,
 *   (error) => `Error: ${error}`
 * );
 * console.log(message); // "Success with value: 42"
 * ```
 */
export const match = <T, E, U>(
  r: Result<T, E>,
  onOk: (v: T) => U,
  onErr: (e: E) => U,
): U => (r.success ? onOk(r.data) : onErr(r.error));

/**
 * Alias for {@link match}. Provides pattern matching functionality.
 *
 * @see match
 */
export const fold = match;
