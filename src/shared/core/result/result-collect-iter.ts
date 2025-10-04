// File: src/shared/core/result/result-collect-iter.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Ok, type Result } from "@/shared/core/result/result";

/**
 * Lazily iterate Ok values until an Err appears.
 * @template TValue
 * @template TError
 * @param source Iterable of Results.
 * @returns Generator yielding Ok values; stops at first Err.
 */
export function* iterateOk<TValue, TError extends ErrorLike = AppError>(
  source: Iterable<Result<TValue, TError>>,
): Generator<
  TValue,
  Result<undefined, TError> | Result<undefined, never>,
  unknown
> {
  for (const r of source) {
    if (!r.ok) {
      return r as Result<undefined, TError>;
    }
    yield r.value;
  }
  return Ok<undefined, never>(undefined);
}

/**
 * Collect all Ok values from an Iterable (not materializing early Err beyond short-circuit).
 * @template TValue
 * @template TError
 * @param source Iterable of Results.
 * @returns Result of readonly array or first Err.
 */
export const collectAllLazy = <TValue, TError extends ErrorLike = AppError>(
  source: Iterable<Result<TValue, TError>>,
): Result<readonly TValue[], TError> => {
  const acc: TValue[] = [];
  for (const r of source) {
    if (!r.ok) {
      return r;
    }
    acc.push(r.value);
  }
  return Ok(acc as readonly TValue[]);
};
