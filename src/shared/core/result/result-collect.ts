import { Err, Ok, type Result } from "@/shared/core/result/result";

export type OkType<R> = R extends Result<infer U, unknown> ? U : never;
export type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/** Collect all Ok values or short-circuit with first Err. */
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

/** Collect tuple (variadic) or short-circuit on first Err. */
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
 * @deprecated Prefer firstOkOrElse; legacy helper using default error on empty.
 */
export const anyOk = <T, E>(results: Result<T, E>[]): Result<T, E> =>
  firstOkOrElse<T, E>(() => new Error("No results provided") as E)(results);

/** First Ok or fallback error (produced if empty). */
export const firstOkOrElse =
  <T, E>(onEmpty: () => E) =>
  (results: Result<T, E>[]): Result<T, E> => {
    let lastErr: Result<never, E> | null = null;
    for (const r of results) {
      if (r.ok) {
        return r;
      }
      lastErr = r as Result<never, E>;
    }
    return lastErr ?? Err(onEmpty());
  };
