import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Run async fn and wrap resolve/reject in Result.
 * Branch semantics: If fn resolves, returns Ok(value). If fn rejects/throws, returns Err(mapped or cast error).
 * @typeParam T - Success type.
 * @typeParam E - Error type (default `Error`).
 * @param fn - Function returning Promise<T>.
 * @param mapError - Optional mapper for unknown error.
 * @returns Promise of Ok or Err.
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
 * Branch semantics: If promise resolves, returns Ok(value). If it rejects, returns Err(mapped or cast error).
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
 * Branch semantics: Same as tryCatchAsync for a provided async function.
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
 * Branch semantics: If Ok, resolves with data. If Err, rejects with error.
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
