// File: `src/shared/core/result/result-collect.ts`

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

export type OkType<R> = R extends Result<infer U, ErrorLike> ? U : never;
export type ErrType<R> = R extends Result<unknown, infer E> ? E : never;

/**
 * Collect all Ok values or short-circuit with the first Err.
 * @template TValue
 * @template TError
 * @param results Readonly list of Results.
 * @returns Result<readonly TValue[],TError>
 */
export const collectAll = <TValue, TError extends ErrorLike = AppError>(
  results: readonly Result<TValue, TError>[],
): Result<readonly TValue[], TError> => {
  const acc: TValue[] = [];
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok<readonly TValue[], TError>(acc as readonly TValue[]);
};

/**
 * Collect a tuple of Results or short-circuit on first Err.
 * @template TTuple Tuple of Result types.
 */
export function collectTuple<
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
 * First Ok or an error produced when the collection is empty.
 * Propagates last Err if none are Ok.
 * @template TValue
 * @template TError
 * @param onEmpty Factory for error when empty.
 */
export const firstOkOrElse =
  <TValue, TError extends ErrorLike = AppError>(onEmpty: () => TError) =>
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
