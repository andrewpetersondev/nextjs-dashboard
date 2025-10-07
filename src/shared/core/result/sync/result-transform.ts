// File: src/shared/core/result/result-transform.ts
import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/sync/result";

/**
 * Chain a computation on the Ok branch (flatMap).
 * @template TValue
 * @template TNext
 * @template TError1
 * @template TError2
 * @param fn Mapping to another Result.
 * @returns Result of chained computation or original Err.
 */
export const flatMap =
  /* @__PURE__ */
    <TValue, TNext, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (v: TValue) => Result<TNext, TError2>,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TNext, TError1 | TError2> =>
      r.ok ? fn(r.value) : (r as Result<TNext, TError1>);
