// src/shared/core/result/result-transform.ts
import type { Result } from "@/shared/core/result/result";

/**
 * Chain a computation on the Ok branch.
 * If r is Ok: returns fn(value). If Err: propagates the same Err.
 * @template T Input success type.
 * @template U Output success type.
 * @template E1 Original error type.
 * @template E2 Chained error type.
 * @param fn Function mapping success value to a new Result.
 * @returns Result<U, E1 | E2>
 */
export const flatMap =
  <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
  (r: Result<T, E1>): Result<U, E1 | E2> => {
    if (r.ok) {
      return fn(r.value);
    }
    return r as Result<U, E1>; // safe: preserving original error branch
  };
