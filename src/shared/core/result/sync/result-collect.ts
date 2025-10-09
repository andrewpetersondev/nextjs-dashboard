// File: src/shared/core/result/sync/result-collect.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Extracts the `Ok` value type `U` from a `Result<U, E>`.
 * @typeParam R `Result<any, any>` to inspect.
 */
export type OkType<R> = R extends Result<infer U, ErrorLike> ? U : never;

/**
 * Extracts the `Err` type `E` from a `Result<T, E>`.
 * @typeParam R `Result<any, any>` to inspect.
 */
export type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/**
 * Eagerly collects all `Ok` values until the first `Err`.
 * - On the first `Err`, returns that error immediately (no further iteration).
 * - If all entries are `Ok`, returns `Ok<readonly TValue[]>` preserving order.
 * Preserves `TError` (defaults to `AppError`); does not normalize or remap errors.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type; defaults to `AppError`.
 * @param results Readonly array of `Result<TValue, TError>`.
 * @returns `Result<readonly TValue[], TError>` — array of all Ok values or the first Err.
 */
export const collectAll = /* @__PURE__ */ <
  TValue,
  TError extends ErrorLike = AppError,
>(
  results: readonly Result<TValue, TError>[],
): Result<readonly TValue[], TError> => {
  const acc: TValue[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly TValue[]);
};

/**
 * Collects a variadic tuple of `Result`s into a `Result` of a tuple.
 * - Short‑circuits on the first `Err` and returns it unchanged.
 * - On success, returns `Ok` of a tuple aligned positionally with inputs.
 * Preserves `TError`; does not normalize or remap errors.
 * @typeParam TError Error type shared by all tuple entries.
 * @typeParam TTuple Tuple of `Result<unknown, TError>`.
 * @returns `Result<{ readonly [K in keyof TTuple]: OkType<TTuple[K]> }, TError>`.
 */
export function collectTuple<
  TError extends ErrorLike,
  TTuple extends readonly Result<unknown, TError>[],
>(
  ...results: TTuple
): Result<{ readonly [K in keyof TTuple]: OkType<TTuple[K]> }, TError> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof TTuple]: OkType<TTuple[K]> },
        TError
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof TTuple]: OkType<TTuple[K]> });
}

/**
 * Collects a heterogeneous tuple of `Result`s with differing error types.
 * - Short‑circuits on the first `Err` and returns it unchanged.
 * - On success, returns `Ok` of a tuple aligned with inputs.
 * Error type is the union of all tuple `Err` types.
 * Use only when mixed error types are required.
 * @typeParam TTuple Tuple of `Result<unknown, ErrorLike>` possibly with different `Err` types.
 * @returns `Result<{ readonly [K in keyof TTuple]: OkType<TTuple[K]> }, ErrType<TTuple[number]>>`.
 */
export function collectTupleHetero<
  TTuple extends readonly Result<unknown, ErrorLike>[],
>(
  ...results: TTuple
): Result<
  { readonly [K in keyof TTuple]: OkType<TTuple[K]> },
  ErrType<TTuple[number]>
> {
  const acc: unknown[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r as Result<
        { readonly [K in keyof TTuple]: OkType<TTuple[K]> },
        ErrType<TTuple[number]>
      >;
    }
    acc.push(r.value);
  }
  return Ok(acc as { readonly [K in keyof TTuple]: OkType<TTuple[K]> });
}

/**
 * Returns the first `Ok` from the list; otherwise returns:
 * - The last `Err` if at least one error is present, or
 * - `Err(onEmpty())` when the list is empty.
 * Curried helper: supply `onEmpty`, then pass the results array.
 * Preserves `TError` (defaults to `AppError`); does not normalize or remap errors.
 * @typeParam TValue Ok value type.
 * @typeParam TError Error type; defaults to `AppError`.
 * @param onEmpty Factory invoked only when the input array is empty.
 * @returns Function mapping `readonly Result<TValue, TError>[]` to `Result<TValue, TError>`.
 */
export const firstOkOrElse =
  /* @__PURE__ */
    <TValue, TError extends ErrorLike = AppError>(onEmpty: () => TError) =>
    /* @__PURE__ */
    (results: readonly Result<TValue, TError>[]): Result<TValue, TError> => {
      let lastErr: Result<never, TError> | null = null;
      for (const r of results) {
        if (r.ok) {
          return r;
        }
        lastErr = r as Result<never, TError>;
      }
      return lastErr ?? Err(onEmpty());
    };
