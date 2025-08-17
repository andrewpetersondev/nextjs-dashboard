import { Err, Ok, type Result } from "@/lib/core/result.base";

/**
 * Executes a function and converts its result or any thrown error into a `Result`.
 *
 * @typeParam T - The type of the value returned on success.
 * @typeParam E - The type of the error returned on failure. Defaults to `Error`.
 * @param fn - The function to execute. If it throws, the error will be caught.
 * @param mapError - An optional callback to map the caught error to type `E`.
 * @returns A `Result` containing the return value of `fn` on success (`Ok<T>`) or the error on failure (`Err<E>`).
 * @remarks If `mapError` is omitted, the thrown value is cast to type `E`.
 *
 * @example
 * ```typescript
 * const result = tryCatch<string, string>(() => {
 *   if (Math.random() > 0.5) throw new Error("Random failure");
 *   return "Success";
 * }, e => e instanceof Error ? e.message : "Unknown error");
 * ```
 */
export const tryCatch = <T, E = Error>(
  fn: () => T,
  mapError?: (e: unknown) => E,
): Result<T, E> => {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as E));
  }
};

/**
 * Executes an asynchronous operation and wraps its result in a `Result` object.
 *
 * @typeParam T - The type of the value resolved by the asynchronous operation on success.
 * @typeParam E - The type of the error wrapped in the `Result` on failure. Defaults to `Error`.
 * @param fn - A function that performs an asynchronous operation and returns a `Promise` resolving to a value of type `T`.
 * @param mapError - An optional callback to map a thrown or rejected value to an error of type `E`.
 *                   If omitted, the thrown/rejected value is cast to type `E` directly.
 * @returns A `Promise` that resolves to `Ok<T>` on success or `Err<E>` on failure, where:
 *          - `Ok<T>` wraps the resolved value of `fn` on success.
 *          - `Err<E>` wraps the error returned by `mapError` or the cast error when `mapError` is omitted.
 * @remarks This utility provides a structured way to handle errors in asynchronous operations using `Result<T, E>`.
 *
 * @example
 * ```typescript
 * const result = await tryCatchAsync<number, string>(
 *   async () => {
 *     if (Math.random() > 0.5) throw new Error("Random failure");
 *     return 42;
 *   },
 *   (e) => e instanceof Error ? e.message : "Unknown error"
 * );
 * ```
 */
export const tryCatchAsync = async <T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
  try {
    const value = await fn();
    return Ok(value);
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as E));
  }
};

/**
 * Converts a `Promise` into a `Result`-like structure, capturing successes and errors.
 *
 * @typeParam T - The type of the successful value resolved by the `Promise`.
 * @typeParam E - The type of the error value. Defaults to `Error`.
 * @param p - The `Promise` to be converted into a `Result`.
 * @param mapError - An optional callback to map the caught error into a defined error type.
 *                   If omitted, the thrown or rejected value is cast to `E`.
 * @returns A `Promise` that resolves to `Ok<T>` if the input `Promise` resolves successfully,
 *          or to `Err<E>` if the input `Promise` rejects or throws.
 * @remarks This function allows you to handle asynchronous operations in a `Result`-like manner
 *          while optionally normalizing error types through the `mapError` callback.
 *
 * @example
 * ```ts
 * const result = await fromPromise<number, string>(
 *   Promise.resolve(42),
 *   (e) => `Error occurred: ${String(e)}`
 * );
 * // result is Ok(42)
 * ```
 */
export const fromPromise = async <T, E = Error>(
  p: Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
  try {
    return Ok(await p);
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as E));
  }
};

/**
 * Executes an asynchronous function and wraps its result in a `Result` type.
 *
 * This utility captures both success and failure outcomes of a promise, allowing for structured
 * error handling. By default, errors are cast to `Error`, but you can provide a custom error mapper
 * to normalize non-`Error` or unknown values.
 *
 * @typeParam T - The type of the success value.
 * @typeParam E - The type of the error value. Defaults to `Error`.
 *
 * @param fn - A function returning a promise that resolves to a value of type `T`.
 * @param mapError - Optional. A callback to transform an unknown error into an error of type `E`.
 *                   If omitted, the error is cast to `E`, assuming it is already of that type.
 *
 * @returns A `Promise` that resolves to a `Result`. On success, the `Result` contains the resolved
 * value of type `T`. On failure, the `Result` contains the mapped or cast error of type `E`.
 *
 * @remarks
 * If `mapError` is provided, it will be invoked with the raw error value, and its result will be
 * used as the error in the `Result`. Ensure `mapError` handles all possible error shapes in your
 * context to avoid unexpected behavior.
 *
 * @example
 * ```typescript
 * const fetchData = async () => {
 *   const result = await fromPromiseFn<string, CustomError>(
 *     async () => {
 *       // Some async logic
 *       return "data";
 *     },
 *     (e) => new CustomError(String(e)) // Custom error mapping
 *   );
 *   // Handle result...
 * };
 * ```
 */
export const fromPromiseFn = <T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => tryCatchAsync(fn, mapError);

/**
 * Converts a `Result` object into a `Promise`.
 *
 * @typeParam T - The type of the successful result value.
 * @typeParam E - The type of the error value.
 *
 * @param r - A `Result` object containing either a successful value (`success: true`)
 * or an error value (`success: false`).
 *
 * @returns A `Promise` that resolves with the successful result value `T`
 * if `r.success` is `true`, or rejects with the error value `E` if `r.success` is `false`.
 *
 * @example
 * ```typescript
 * const result: Result<number, string> = { success: true, data: 42 };
 * const promise: Promise<number> = toPromise(result);
 * ```
 */
export const toPromise = <T, E>(r: Result<T, E>): Promise<T> => {
  return r.success ? Promise.resolve(r.data) : Promise.reject(r.error);
};
