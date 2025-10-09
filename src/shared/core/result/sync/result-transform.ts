// File: src/shared/core/result/result-transform.ts

import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";

/**
 * Applies a transformation function to a successful `Result` value, returning a new `Result`.
 *
 * @typeParam TValue - The type of the input value in the initial `Result`.
 * @typeParam TNext - The type of the resulting value after transformation.
 * @typeParam TError1 - The type of the error in the initial `Result`.
 * @typeParam TError2 - The type of the error in the transformed `Result`.
 * @param fn - The function to map over a successful `Result`.
 * @returns A new `Result` containing either the transformed value or the original error.
 */
export const flatMap =
  /* @__PURE__ */
    <TValue, TNext, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (v: TValue) => Result<TNext, TError2>,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TNext, TError1 | TError2> =>
      r.ok ? fn(r.value) : (r as Result<TNext, TError1>);
