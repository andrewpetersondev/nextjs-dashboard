// File: src/shared/core/result/sync/result-transform.ts

import type { AppError } from "@/shared/core/result/app-error/app-error";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Applies a transformation function to the value of a successful `Result`,
 * flattening the nested `Result` output into a single layer.
 *
 * @typeParam Tvalue - The type of the input value in the `Result`.
 * @typeParam Tnext - The type of the output value after applying the transformation.
 * @typeParam Terror1 - The type of the original error in the `Result`.
 * @typeParam Terror2 - The type of the error that may arise during the transformation.
 * @param fn - A function that transforms the `Tvalue` to a `Result<Tnext, Terror2>`.
 * @returns A new `Result` either containing the transformed value or an error.
 * @example
 * const result = flatMap(v => Ok(v * 2))(Ok(5)); // Ok(10)
 * const errorResult = flatMap(v => Err(new Error('Failed')))(Ok(5)); // Err
 */
export const flatMap =
  /* @__PURE__ */
    <Tvalue, Tnext, Terror1 extends AppError, Terror2 extends AppError>(
      fn: (v: Tvalue) => Result<Tnext, Terror2>,
    ) =>
    /* @__PURE__ */
    (r: Result<Tvalue, Terror1>): Result<Tnext, Terror1 | Terror2> =>
      r.ok ? fn(r.value) : Err(r.error);
