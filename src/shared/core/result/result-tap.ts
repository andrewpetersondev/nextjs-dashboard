// File: src/shared/core/result/result-tap.ts
import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";

/**
 * Side-effect on success branch.
 * @template TValue
 * @template TError
 * @param fn Consumer.
 * @returns Original Result.
 */
export const tapOk =
  <TValue, TError extends ErrorLike>(fn: (v: TValue) => void) =>
  (r: Result<TValue, TError>): Result<TValue, TError> => {
    if (r.ok) {
      fn(r.value);
    }
    return r;
  };

/**
 * Side-effect on error branch.
 * @template TValue
 * @template TError
 * @param fn Consumer.
 * @returns Original Result.
 */
export const tapError =
  <TValue, TError extends ErrorLike>(fn: (e: TError) => void) =>
  (r: Result<TValue, TError>): Result<TValue, TError> => {
    if (!r.ok) {
      fn(r.error);
    }
    return r;
  };
