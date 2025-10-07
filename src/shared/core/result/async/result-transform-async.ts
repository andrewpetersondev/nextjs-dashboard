// File: src/shared/core/result/result-transform-async.ts
import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/sync/result";

/**
 * Async flatMap over Ok branch.
 * @template TValue
 * @template TNext
 * @template TError1
 * @template TError2
 * @param fn Async mapper returning a Result.
 */
export const flatMapAsync =
  /* @__PURE__ */
    <TValue, TNext, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (v: TValue) => Promise<Result<TNext, TError2>>,
    ) =>
    /* @__PURE__ */
    async (
      r: Result<TValue, TError1>,
    ): Promise<Result<TNext, TError1 | TError2>> =>
      r.ok ? fn(r.value) : (r as Result<TNext, TError1>);
