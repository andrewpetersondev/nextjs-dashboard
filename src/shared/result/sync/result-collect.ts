import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/result/result";
import type { ErrType, OkType, Result } from "@/shared/result/result.types";

/**
 * Iterates over `source`, yielding values from successful results until an error is encountered.
 *
 * The generator yields each success value as it is encountered. If an `Err` is seen,
 * iteration stops and the generator returns that `Err`. If the iterable completes
 * without errors, the generator returns `Ok<void>(undefined)`.
 *
 * @typeParam T - The type of successful values in the results.
 * @typeParam E - The type of the error, extending `AppError`.
 * @param source - An iterable of `Result<T, E>` to process.
 * @returns A generator that yields `T` values and returns `Result<void, E>`:
 * - returns `Err(error)` if an error result is encountered,
 * - returns `Ok<void>(undefined)` when iteration completes successfully.
 */
export function* iterateOk<T, E extends AppError>(
  source: Iterable<Result<T, E>>,
): Generator<T, Result<void, E>, unknown> {
  for (const r of source) {
    if (!r.ok) {
      return Err(r.error);
    }
    yield r.value;
  }
  return Ok<void>(undefined);
}

/**
 * Collects all successful results from the provided array, returning a combined `Result`.
 *
 * @typeParam T - The type of the successful value in the `Result`.
 * @typeParam E - The type of the error, constrained to `AppError`.
 * @param results - An array of `Result` objects to process.
 * @returns A `Result` containing an array of all successful values (`Ok`) or the first encountered error (`Err`).
 */
export const collectAll = /* @__PURE__ */ <T, E extends AppError>(
  results: readonly Result<T, E>[],
): Result<readonly T[], E> => {
  const acc: T[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly T[]);
};

/**
 * Collects all successful values from `source` into a readonly array, or returns the first error encountered.
 *
 * Iterates over the provided iterable and accumulates `value` from each `Ok`.
 * If any `Result` is `Err`, the function returns that `Err` immediately without processing further elements.
 *
 * @typeParam T - The type of the values contained in successful results.
 * @typeParam E - The type of the error, extending `AppError`.
 * @param source - An iterable of `Result<T, E>` to collect.
 * @returns `Ok` with a readonly array of all collected values when all results are successful,
 * or the first encountered `Err`.
 */
export const collectAllLazy = /* @__PURE__ */ <T, E extends AppError>(
  source: Iterable<Result<T, E>>,
): Result<readonly T[], E> => {
  const acc: T[] = [];
  for (const r of source) {
    if (!r.ok) {
      return Err(r.error);
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly T[]);
};

/**
 * Gathers a tuple of `Result` values into a single `Result`, returning all `Ok` values
 * if successful or the first encountered `Err` otherwise.
 *
 * @typeParam E - The type of error used in the `Result`, constrained to `AppError`.
 * @typeParam Tt - The tuple type of `Result` objects to process.
 * @param results - A variadic list of `Result` objects to combine.
 * @returns A `Result` containing a readonly tuple of all `Ok` values or the first `Err`.
 * @example
 * const res = collectTuple(Ok(1), Ok(2), Err({ code: 'E', message: 'Fail' }));
 * // => Err<{ code: 'E', message: string }>
 */
export function collectTuple<
  E extends AppError,
  Tt extends readonly Result<unknown, E>[],
>(...results: Tt): Result<{ readonly [K in keyof Tt]: OkType<Tt[K]> }, E> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<{ readonly [K in keyof Tt]: OkType<Tt[K]> }, E>;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof Tt]: OkType<Tt[K]> });
}

/**
 * Processes an array of heterogeneous `Result` objects and groups their successes
 * or returns the first error encountered.
 *
 * @typeParam Tt - The tuple type of heterogeneous `Result` objects to process.
 * @param results - A variadic list of `Result` objects to combine. Errors are constrained to `AppError`.
 * @returns A `Result` containing either a readonly tuple of all successful values or the first occurred `Err`.
 */
export function collectTupleHetero<
  Tt extends readonly Result<unknown, AppError>[],
>(
  ...results: Tt
): Result<{ readonly [K in keyof Tt]: OkType<Tt[K]> }, ErrType<Tt[number]>> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof Tt]: OkType<Tt[K]> },
        ErrType<Tt[number]>
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof Tt]: OkType<Tt[K]> });
}

/**
 * Returns the first successful `Result` in the provided array, or an error result
 * created using `onEmpty` if none are successful.
 *
 * @typeParam T - The type of the value in a successful `Result`.
 * @typeParam E - The type of the error in a failed `Result`, constrained to `AppError`.
 * @param onEmpty - A callback that produces a fallback error when no successful result is found.
 * @returns The first `Result` with `ok: true`, or a fallback `Err` produced by `onEmpty`.
 * @example
 * const pick = firstOkOrElse(() => ({ code: 'EMPTY', message: 'No results' }));
 * const res = pick([Err({ code: 'E', message: 'fail' }), Ok(5)]);
 * // => Ok(5)
 */
export const firstOkOrElse =
  /* @__PURE__ */
    <T, E extends AppError>(onEmpty: () => E) =>
    /* @__PURE__ */
    (results: readonly Result<T, E>[]): Result<T, E> => {
      let lastErr: Result<never, E> | null = null;
      for (const r of results) {
        if (r.ok) {
          return r;
        }
        lastErr = r as Result<never, E>;
      }
      return lastErr ?? Err(onEmpty());
    };
