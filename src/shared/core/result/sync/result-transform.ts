// File: src/shared/core/result/sync/result-transform.ts

import type { AppError } from "@/shared/core/result/app-error/app-error";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Applies a transformation function to the value of a successful `Result`,
 * flattening the nested `Result` output into a single layer.
 *
 * @typeParam TValue - The type of the input value in the `Result`.
 * @typeParam TNext - The type of the output value after applying the transformation.
 * @typeParam TError1 - The type of the original error in the `Result`.
 * @typeParam TError2 - The type of the error that may arise during the transformation.
 * @param fn - A function that transforms the `TValue` to a `Result<TNext, TError2>`.
 * @returns A new `Result` either containing the transformed value or an error.
 * @example
 * const result = flatMap(v => Ok(v * 2))(Ok(5)); // Ok(10)
 * const errorResult = flatMap(v => Err(new Error('Failed')))(Ok(5)); // Err
 */
export const flatMap =
  /* @__PURE__ */
    <TValue, TNext, TError1 extends AppError, TError2 extends AppError>(
      fn: (v: TValue) => Result<TNext, TError2>,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TNext, TError1 | TError2> =>
      r.ok ? fn(r.value) : Err(r.error);
