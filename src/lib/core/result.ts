/**
 * Result Pattern Implementation
 *
 * This module implements the Result pattern, a functional programming construct for handling
 * success and error cases in a type-safe way. It provides:
 * - Type-safe error handling without exceptions
 * - Composable operations (map, chain, bimap)
 * - Utility functions for working with async operations
 * - Pattern matching capabilities
 *
 * The Result type is a union type that can either be:
 * - Ok: Representing success with associated data
 * - Err: Representing failure with associated error
 */

export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export const Ok = <T>(data: T): Result<T, never> =>
  ({ data, success: true }) as const;

export const Err = <E>(error: E): Result<never, E> =>
  ({ error, success: false }) as const;

export const unwrap = <T, E>(r: Result<T, E>): T => {
  if (r.success) return r.data;
  throw r.error;
};

// Safe unwraps
export const unwrapOr =
  <T, E>(fallback: T) =>
  (r: Result<T, E>): T =>
    r.success ? r.data : fallback;

export const unwrapOrElse =
  <T, E>(fallback: (e: E) => T) =>
  (r: Result<T, E>): T =>
    r.success ? r.data : fallback(r.error);

// Type guards
export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } =>
  r.success;
export const isErr = <T, E>(
  r: Result<T, E>,
): r is { success: false; error: E } => !r.success;

// Transformations
/**
 * Transforms the data contained in a `Result` using the provided mapping function.
 *
 * This higher-order function takes a mapping function `fn` and applies it to the data
 * within a successful `Result` instance. If the `Result` represents a failure, the
 * mapping function is not applied, and the failure `Result` is returned unchanged.
 *
 * @template T - The type of the input data within the `Result`.
 * @template U - The type of the transformed data after applying the mapping function.
 * @template E - The type of the error in the `Result`.
 *
 * @param {function(T): U} fn - The transformation function to apply to the data within the `Result` on success.
 * @returns A function that takes a `Result` of type T and applies the mapping function to its data if successful, returning a new `Result`.
 *
 * @example
 * const r1 = Ok(5);
 * const doubled = map((x: number) => x * 2)(r1); // Ok(10)
 *
 * const r2 = Err("error");
 * const doubled2 = map((x: number) => x * 2)(r2); // Err("error")
 */
export const map =
  <T, U, E>(fn: (v: T) => U) =>
  (r: Result<T, E>): Result<U, E> =>
    r.success ? Ok(fn(r.data)) : r;

export const chain =
  <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
  (r: Result<T, E1>): Result<U, E1 | E2> =>
    r.success ? fn(r.data) : r;

// Alias for FP communities (aka bind/flatMap)
export const andThen = chain;

export const mapError =
  <T, E1, E2>(fn: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<T, E2> =>
    r.success ? r : Err(fn(r.error));

export const bimap =
  <T, U, E1, E2>(onOk: (v: T) => U, onErr: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<U, E2> =>
    r.success ? Ok(onOk(r.data)) : Err(onErr(r.error));

// Matching
export const match = <T, E, U>(
  r: Result<T, E>,
  onOk: (v: T) => U,
  onErr: (e: E) => U,
): U => (r.success ? onOk(r.data) : onErr(r.error));
export const fold = match;

// Async helpers
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

// - Type casting on fromPromise
//     - The pattern (await fromPromise(...)) as Result<...> relies on casts. If possible, make fromPromise generic-aware or wrap it to avoid repetitive casting and ensure type-safety.
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

// Interop: convert Result to a Promise (rejects with error on Err)
export const toPromise = async <T, E>(r: Result<T, E>): Promise<T> => {
  return r.success ? r.data : Promise.reject(r.error);
};

// Utilities
export const tap =
  <T, E>(fn: (v: T) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (r.success) fn(r.data);
    return r;
  };

export const tapError =
  <T, E>(fn: (e: E) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (!r.success) fn(r.error);
    return r;
  };

/**
 * Lift a nullable/undefined into a Result.
 */
export const fromNullable = <T, E>(
  v: T | null | undefined,
  onNull: () => E,
): Result<T, E> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Combines an array of Results into a single Result containing an array of success values.
 * If any Result is an Err, returns the first Err encountered.
 */
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const acc: T[] = [];
  for (const r of results) {
    if (!r.success) return r;
    acc.push(r.data);
  }
  return Ok(acc);
};

// Combine a tuple of Results into a Result of a tuple (preserves tuple types)
type OkType<R> = R extends Result<infer U, unknown> ? U : never;
type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

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
export const anyOk = <T, E>(results: Result<T, E>[]): Result<T, E> => {
  let lastErr: Result<never, E> | null = null;
  for (const r of results) {
    if (r.success) return r;
    lastErr = r as Result<never, E>;
  }
  return lastErr ?? Err<E>(new Error("No results provided") as E);
};
