import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Success type of a Result.
 * @typeParam R - Result-like type.
 */
export type OkType<R> = R extends Result<infer U, unknown> ? U : never;

/**
 * Error type of a Result.
 * @typeParam R - Result-like type.
 */
export type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/**
 * Collect successes or short-circuit on first error.
 *
 * Branch semantics: Iterates left-to-right; accumulates data from Ok items. On first Err, returns that Err immediately.
 *
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param results - Array of results.
 * @returns Ok of all data if all succeed; otherwise the first Err.
 */
export const collectAll = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
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
 *
 * Branch semantics: Processes arguments left-to-right; returns Ok(tuple of data) if all are Ok. On first Err, returns that Err.
 *
 * @typeParam T - Tuple of Result values.
 * @param results - Results to combine.
 * @returns Ok of tuple of data if all succeed; otherwise the first Err.
 */
export function collectTuple<T extends readonly Result<unknown, unknown>[]>(
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

/**
 * First Ok or last Err.
 * Branch semantics: Same as firstOkOrElse with a default onEmpty Error. Prefer firstOkOrElse.
 * @deprecated Prefer anyOkOrElse to avoid unsafe default error construction when input is empty.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param results - Results to scan.
 * @returns First Ok found; otherwise last Err (or an Err with generic error if none provided).
 */
export const anyOk = <T, E>(results: Result<T, E>[]): Result<T, E> => {
  return firstOkOrElse<T, E>(() => new Error("No results provided") as E)(
    results,
  );
};
/**
 * First Ok or fallback Err produced by onEmpty.
 * Branch semantics: Returns the first Ok if found. If none, returns the last Err seen or Err(onEmpty()) if input is empty.
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param onEmpty - Error factory when none succeed.
 * @returns First Ok if present; otherwise Err(onEmpty()).
 */
export const firstOkOrElse =
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
