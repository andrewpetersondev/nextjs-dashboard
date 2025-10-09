// File: src/shared/core/result/sync/result-transform.ts

import type { ErrorLike } from "@/shared/core/result/error";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Transforms the `Result<TValue, TError1>` by applying a mapping function to the inner value
 * if it is `ok`, returning a new `Result`. If it is an error, the original error is propagated.
 *
 * @typeParam TValue - The type of the input value in the `Result`.
 * @typeParam TNext - The type of the resulting value after the mapping function is applied.
 * @typeParam TError1 - The type of the original error in the `Result`.
 * @typeParam TError2 - The type of the possible error after applying the mapping function.
 * @returns A new `Result` reflecting the mapped value or the combined error type.
 */
export const flatMap =
  /* @__PURE__ */
    <TValue, TNext, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (v: TValue) => Result<TNext, TError2>,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TNext, TError1 | TError2> =>
      r.ok ? fn(r.value) : Err<TNext, TError1>(r.error);
