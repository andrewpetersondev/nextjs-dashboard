// File: src/shared/core/result/async/result-async.ts
// Purpose: Adapter-first async Result helpers (no default BaseError). Callers must pass mappers.
import type { BaseError } from "@/shared/errors/base-error";
import { Err, Ok, type Result } from "@/shared/result/result";

/**
 * Represents an asynchronous thunk function that returns a promise resolving to a specified value type.
 *
 * @typeParam Tvalue - The type of the value the promise resolves to.
 * @example
 * ```ts
 * const fetchData: AsyncThunk<string> = async () => "Hello, World!";
 * ```
 */
export type AsyncThunk<Tvalue> = () => Promise<Tvalue>;

/**
 * Executes an asynchronous function and wraps the result in a Result object.
 *
 * @typeParam Tvalue - The type of the value returned on success.
 * @typeParam Terror - The type of the error, extending BaseError.
 * @param fn - The asynchronous function to execute.
 * @param mapError - A function to map unknown errors to a specific error type.
 * @returns A Promise resolving to a Result object with either a success value or an error.
 */
export async function tryCatchAsync<Tvalue, Terror extends BaseError>(
  fn: AsyncThunk<Tvalue>,
  mapError: (e: unknown) => Terror,
): Promise<Result<Tvalue, Terror>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Executes a promise-returning function and maps errors to a custom error type.
 *
 * @param fn - A thunk that returns a promise resolving to a value of type `Tvalue`.
 * @param mapError - A function to map any thrown error to a `Terror` type.
 * @returns A `Promise` resolving to either `Ok<Tvalue>` or `Err<Terror>`.
 */
export async function fromPromiseThunk<Tvalue, Terror extends BaseError>(
  fn: () => Promise<Tvalue>,
  mapError: (e: unknown) => Terror,
): Promise<Result<Tvalue, Terror>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(mapError(e));
  }
}

export const fromAsyncThunk = /* @__PURE__ */ <
  Tvalue,
  Terror extends BaseError,
>(
  fn: () => Promise<Tvalue>,
  mapError: (e: unknown) => Terror,
): Promise<Result<Tvalue, Terror>> => fromPromiseThunk(fn, mapError);

/**
 * Converts a promise into a `Result` object, mapping any error to a custom error type.
 *
 * @typeParam Tvalue - The type of the resolved value of the promise.
 * @typeParam Terror - The type of the mapped error, extending `BaseError`.
 * @param p - The promise to be converted to a `Result`.
 * @param mapError - A function that maps unknown errors to a `Terror`.
 * @returns A `Result` containing either the resolved value or the mapped error.
 */
export async function fromPromise<Tvalue, Terror extends BaseError>(
  p: Promise<Tvalue>,
  mapError: (e: unknown) => Terror,
): Promise<Result<Tvalue, Terror>> {
  try {
    return Ok(await p);
  } catch (e) {
    return Err(mapError(e));
  }
}

/**
 * Converts a `Result` to a `Promise`. Resolves with the value if the result is ok,
 * otherwise rejects with the error.
 *
 * @typeParam Tvalue - The type of the success value contained in the Result.
 * @typeParam Terror - The type of the error, extending BaseError.
 * @param r - The Result to be transformed into a Promise.
 * @returns A Promise that resolves to `Tvalue` or rejects with `Terror`.
 * @throws Throws the error if the result is not ok.
 */
export const toPromiseOrThrow = <Tvalue, Terror extends BaseError>(
  r: Result<Tvalue, Terror>,
): Promise<Tvalue> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);
