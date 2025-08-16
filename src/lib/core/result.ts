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

// Todo: This result shape is pretty bare. What is best practice?
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

// Type guards
export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } =>
  r.success;
export const isErr = <T, E>(
  r: Result<T, E>,
): r is { success: false; error: E } => !r.success;

// Transformations
export const map =
  <T, U, E>(fn: (v: T) => U) =>
  (r: Result<T, E>): Result<U, E> =>
    r.success ? Ok(fn(r.data)) : r;

export const chain =
  <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
  (r: Result<T, E1>): Result<U, E1 | E2> =>
    r.success ? fn(r.data) : r;

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
