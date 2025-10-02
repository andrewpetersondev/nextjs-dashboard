import { Err, Ok, type Result } from "@/shared/core/result/result";

export type OkType<R> = R extends Result<infer U, unknown> ? U : never;
export type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/**
 * Collect all Ok values or short-circuit with the first Err.
 * @template T Success type.
 * @template E Error type (propagated, not constructed).
 */
export const collectAll = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const acc: T[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc);
};

/**
 * Collect a tuple of Results or short-circuit on first Err.
 * @template T Tuple of Result types.
 * @returns Result of unpacked Ok values preserving order or first Err.
 */
export function collectTuple<T extends readonly Result<unknown, unknown>[]>(
  ...results: T
): Result<{ [K in keyof T]: OkType<T[K]> }, ErrType<T[number]>> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<never, ErrType<T[number]>>;
    }
    acc.push(r.value);
  }
  return Ok(acc as { [K in keyof T]: OkType<T[K]> });
}

/**
 * Deprecated: Prefer `firstOkOrElse`.
 * Returns the first Ok or a fabricated Error when the list is empty.
 * @template T Success type.
 * @template TError Error-like type.
 * @deprecated Use `firstOkOrElse(() => new Error(...))`.
 */
export const anyOk = <T, TError extends Error | { message: string } = Error>(
  results: Result<T, TError>[],
): Result<T, TError> =>
  firstOkOrElse<T, TError>(() => new Error("No results provided") as TError)(
    results,
  );

/**
 * First Ok or an error produced when the collection is empty.
 * Propagates last Err if none are Ok.
 * @template T Success type.
 * @template TError Error-like type.
 * @param onEmpty Factory for error when input array is empty.
 */
export const firstOkOrElse =
  <T, TError extends Error | { message: string }>(onEmpty: () => TError) =>
  (results: Result<T, TError>[]): Result<T, TError> => {
    let lastErr: Result<never, TError> | null = null;
    for (const r of results) {
      if (r.ok) {
        return r;
      }
      lastErr = r as Result<never, TError>;
    }
    return lastErr ?? Err(onEmpty());
  };
