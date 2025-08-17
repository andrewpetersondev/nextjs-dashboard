import { Err, Ok, type Result } from "@/lib/core/result.base";

/**
 * A utility type that extracts the `Ok` type from a `Result` type.
 *
 * This type works with a generic `Result` type and retrieves the success type (`Ok` type)
 * when the input type is a `Result`. If the input type does not match a `Result`, it resolves to `never`.
 *
 * @typeparam R - The generic type to be checked and from which the `Ok` type is extracted.
 *
 * Usage example:
 * ```ts
 * type MyResult = Result<string, Error>;
 * type SuccessType = OkType<MyResult>; // Resulting type is string
 * ```
 */
type OkType<R> = R extends Result<infer U, unknown> ? U : never;
/**
 * A utility type `ErrType` that extracts the error type `E` from a `Result` type.
 *
 * `ErrType` is a conditional type that evaluates to the error type `E` in the generic type `Result<T, E>`.
 * If the provided type `R` is not a `Result` type, it resolves to `never`.
 *
 * This type is commonly used for strongly typing the error portion of a `Result` in cases where the error
 * structure is known and needs to be inferred from a broader type definition.
 *
 * @typeParam R - A generic type that represents a `Result` or a type that can be evaluated to extract the error type.
 * @returns The extracted error type `E` if `R` extends `Result<unknown, E>`, otherwise it resolves to `never`.
 */
type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/**
 * Applies a provided function to the successful value of a `Result` without modifying the `Result` itself.
 *
 * The `tap` function is generally used for executing side effects, such as logging or debugging,
 * when a `Result` is successful. It ensures the original `Result` is returned unchanged, regardless
 * of whether the function is executed.
 *
 * @template T - The type of the successful result value.
 * @template E - The type of the error value in the `Result`.
 *
 * @param fn - A function to be executed when the `Result` is successful. It receives the successful
 * value as its argument.
 *
 * @returns A function that takes a `Result` and applies the provided function `fn` to its successful
 * value if `r.success` is `true`, then returns the original `Result`.
 */
export const tap =
  <T, E>(fn: (v: T) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (r.success) fn(r.data);
    return r;
  };

/**
 * A higher-order function that intercepts errors in a `Result` and allows
 * a specified callback function to handle the error.
 *
 * The `tapError` function takes a callback as its parameter, which is invoked
 * with the error value if the `Result` represents a failure. The original
 * `Result` object is then returned unchanged.
 *
 * @typeParam T - The type of the success value in the `Result`.
 * @typeParam E - The type of the error value in the `Result`.
 * @param fn - A callback function that processes the error when the `Result`
 *             is a failure.
 * @returns A function that takes a `Result` object. If the `Result` is a failure,
 *          the specified callback `fn` is invoked with the error, and the
 *          original `Result` is returned.
 *
 * @usage
 * ```ts
 * const logError = (error: string) => console.error('Error:', error);
 * const safeResult = tapError(logError)(result);
 * ```
 */
export const tapError =
  <T, E>(fn: (e: E) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (!r.success) fn(r.error);
    return r;
  };

/**
 * Transforms a potentially `null` or `undefined` value into a `Result` type.
 * If the input value is neither `null` nor `undefined`, it constructs an `Ok` result containing the value.
 * Otherwise, it constructs an `Err` result using the provided function for error generation.
 *
 * @typeparam T - The type of the successful result.
 * @typeparam E - The type of the error result.
 *
 * @param v - The input value which can be of type `T`, `null`, or `undefined`.
 * @param onNull - A function that generates the error value if the input is `null` or `undefined`.
 *
 * @returns A `Result` type which is either `Ok<T>` if the input is not `null` or `undefined`,
 *          or `Err<E>` if the input is `null` or `undefined`.
 */
export const fromNullable = <T, E>(
  v: T | null | undefined,
  onNull: () => E,
): Result<T, E> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Combines an array of `Result` objects into a single `Result` object containing an array of their successful values,
 * or propagates the first encountered error.
 *
 * If all `Result` objects in the input array are successful, the returned `Result` will contain
 * an array with their unwrapped successful values. If any `Result` object in the input array is an error,
 * the function will return the first encountered error without evaluating further.
 *
 * @template T The type of the data contained in the successful `Result` objects.
 * @template E The type of the error contained in the error `Result` objects.
 * @param results An array of `Result` objects to combine.
 * @returns A `Result` that is either a successful `Result` containing an array of successful values
 * from all `results`, or the first error `Result` encountered in the array.
 */
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const acc: T[] = [];
  for (const r of results) {
    if (!r.success) return r;
    acc.push(r.data);
  }
  return Ok(acc);
};

/**
 * Processes an array of `Result` objects and returns a single `Result` wrapping an array of the successful data values.
 * If any `Result` in the input is a failure, it immediately returns that failure.
 *
 * @param results A variadic array of `Result` objects to be processed. Each `Result` should conform to the generic type `T`.
 * @returns A `Result` containing an array of the `Ok` types corresponding to the input `Result` objects,
 *          or a single `Err` type if any of the inputs are failures.
 *
 * @example
 * ```
 * const resultA = Ok(1);
 * const resultB = Ok("string");
 * const resultC = Err("error");
 *
 * const combinedSuccess = allTuple(resultA, resultB); // Result<{0: number, 1: string}, never>
 * const combinedFailure = allTuple(resultA, resultC); // Result<never, string>
 * ```
 */
export function allTuple<T extends readonly Result<unknown, unknown>[]>(
  ...results: T
): Result<{ [K in keyof T]: OkType<T[K]> }, ErrType<T[number]>> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.success) {
      return r as Result<never, ErrType<T[number]>>;
    }
    acc.push(r.data);
  }
  return Ok(acc as { [K in keyof T]: OkType<T[K]> });
}

// Return the first Ok, or the last Err if none succeeded
/**
 * Evaluates an array of `Result` objects and returns the first successful result if one exists.
 * If no result is successful, it returns the last error result encountered.
 * If the input array is empty, it returns an error result wrapped with a default error message.
 *
 * @template T The type of the successful result value.
 * @template E The type of the error value.
 * @param results An array of `Result` objects to evaluate.
 * @returns The first successful `Result` if available, or the last error result encountered.
 *          If the array is empty, a default error result is returned.
 */
export const anyOk = <T, E>(results: Result<T, E>[]): Result<T, E> => {
  let lastErr: Result<never, E> | null = null;
  for (const r of results) {
    if (r.success) return r;
    lastErr = r as Result<never, E>;
  }
  return lastErr ?? Err<E>(new Error("No results provided") as E);
};

/**
 * A utility function that processes an array of `Result` objects, returning the first successful result if available.
 * If no successful result is found, it returns the last error or constructs a new error using the provided function.
 *
 * @template T The type of the succesful result's value.
 * @template E The type of the error's value.
 *
 * @param onEmpty A function that generates a default error value when the input array is empty or contains no successful results.
 * @returns A function that takes an array of `Result<T, E>` objects and returns either the first successful result
 * or an error result.
 */
export const anyOkOrElse =
  <T, E>(onEmpty: () => E) =>
  (results: Result<T, E>[]): Result<T, E> => {
    let lastErr: Result<never, E> | null = null;
    for (const r of results) {
      if (r.success) return r;
      lastErr = r as Result<never, E>;
    }
    return lastErr ?? Err(onEmpty());
  };
