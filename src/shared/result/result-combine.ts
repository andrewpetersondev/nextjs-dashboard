import { Err, Ok, type Result } from "@/shared/result/result-base";

/**
 * Success type of a Result.
 * @typeParam R - Result-like type.
 */
type OkType<R> = R extends Result<infer U, unknown> ? U : never;

/**
 * Error type of a Result.
 * @typeParam R - Result-like type.
 */
type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/**
 * Side-effect on success; returns the original result.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param fn - Callback invoked with success value.
 * @returns Unmodified input result.
 */
export const tap =
  <T, E>(fn: (v: T) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (r.success) {
      fn(r.data);
    }
    return r;
  };

/**
 * Side-effect on error; returns the original result.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param fn - Callback invoked with error value.
 * @returns Unmodified input result.
 */
export const tapError =
  <T, E>(fn: (e: E) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (!r.success) {
      fn(r.error);
    }
    return r;
  };

/**
 * Wrap nullable value into Result.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param v - Value that may be null/undefined.
 * @param onNull - Error factory when value is nullish.
 * @returns Ok(v) if defined; otherwise Err(onNull()).
 */
export const fromNullable = <T, E>(
  v: T | null | undefined,
  onNull: () => E,
): Result<T, E> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Collect successes or short-circuit on first error.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param results - Array of results.
 * @returns Ok of all data if all succeed; otherwise the first Err.
 */
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const acc: T[] = [];
  for (const r of results) {
    if (!r.success) {
      return r;
    }
    acc.push(r.data);
  }
  return Ok(acc);
};

/**
 * Combine results into a tuple; short-circuit on first error.
 * @typeParam T - Tuple of Result values.
 * @param results - Results to combine.
 * @returns Ok of tuple of data if all succeed; otherwise the first Err.
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
 * First Ok or last Err.
 *
 * @deprecated Prefer anyOkOrElse to avoid unsafe default error construction when input is empty.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param results - Results to scan.
 * @returns First Ok found; otherwise last Err (or an Err with generic error if none provided).
 */
export const anyOk = <T, E>(results: Result<T, E>[]): Result<T, E> => {
  return anyOkOrElse<T, E>(() => new Error("No results provided") as E)(
    results,
  );
};

/**
 * First Ok or fallback Err produced by onEmpty.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param onEmpty - Error factory when none succeed.
 * @returns First Ok if present; otherwise Err(onEmpty()).
 */
export const anyOkOrElse =
  <T, E>(onEmpty: () => E) =>
  (results: Result<T, E>[]): Result<T, E> => {
    let lastErr: Result<never, E> | null = null;
    for (const r of results) {
      if (r.success) {
        return r;
      }
      lastErr = r as Result<never, E>;
    }
    return lastErr ?? Err(onEmpty());
  };
