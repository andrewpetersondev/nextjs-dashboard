// File: src/shared/core/result/result-collect-iter.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Ok, type Result } from "@/shared/core/result/sync/result";

/**
 * Lazily iterate Ok values until an Err appears.
 * @template TValue
 * @template TError
 * @param source Iterable of Results.
 * @returns Generator yielding Ok values; stops at first Err.
 */
export function* iterateOk<TValue, TError extends ErrorLike = AppError>(
  source: Iterable<Result<TValue, TError>>,
): Generator<TValue, Result<void, TError>, unknown> {
  for (const r of source) {
    if (!r.ok) {
      return r as Result<void, TError>;
    }
    yield r.value;
  }
  return Ok<void, TError>(undefined);
}

/**
 * Collect all Ok values from an Iterable (not materializing early Err beyond short-circuit).
 * @template TValue
 * @template TError
 * @param source Iterable of Results.
 * @returns Result of readonly array or first Err.
 */
export const collectAllLazy = /* @__PURE__ */ <
  TValue,
  TError extends ErrorLike = AppError,
>(
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
