// File: src/shared/core/result/sync/result-map.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Curried mapper that transforms the success (`Ok`) branch of a {@link Result}.
 *
 * @typeParam TValue Success value input type.
 * @typeParam TNext Transformed success value output type.
 * @typeParam TError Error type (carried through unchanged).
 *
 * @param fn Pure function applied only when the result is `Ok`.
 * @returns A function that applies the mapping to a {@link Result}.
 *
 * @remarks
 * - Does not allocate a new object for `Err` results (original reference preserved).
 * - Use when only the success branch needs modification.
 */
export type MapOk = <TValue, TNext, TError extends ErrorLike = AppError>(
  fn: (v: TValue) => TNext,
) => (r: Result<TValue, TError>) => Result<TNext, TError>;

/**
 * Map the success value of a {@link Result} (error branch untouched).
 *
 * @see MapOk
 */
export const mapOk: MapOk =
  /* @__PURE__ */
    (fn) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? Ok(fn(r.value)) : r;

/**
 * Curried mapper that replaces (not widens) the error type of a {@link Result}.
 *
 * @typeParam TValue Success value type (preserved).
 * @typeParam TError1 Original error type.
 * @typeParam TError2 New error type (replacement).
 *
 * @param fn Pure function to transform the original error into a new error.
 * @returns A function that applies the error mapping to a {@link Result}.
 *
 * @remarks
 * - Use when you want to strictly convert `Err<TError1>` into `Err<TError2>`.
 * - The original error type is not retained; for widening use {@link mapErrorUnion}.
 */
export type MapError = <
  TValue,
  TError1 extends ErrorLike = AppError,
  TError2 extends ErrorLike = AppError,
>(
  fn: (e: TError1) => TError2,
) => (r: Result<TValue, TError1>) => Result<TValue, TError2>;

/**
 * Standard error mapping (replacement semantics).
 *
 * @see MapError
 */
export const mapError: MapError =
  /* @__PURE__ */
    (fn) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? r : Err(fn(r.error));

/**
 * Curried mapper that widens the error type by unioning the original and the mapped error.
 *
 * @typeParam TValue Success value type.
 * @typeParam TError1 Original error type.
 * @typeParam TError2 Added (mapped) error type.
 *
 * @param fn Pure function to map the original error to an additional error variant.
 * @returns A function producing a {@link Result} whose error is `TError1 | TError2`.
 *
 * @remarks
 * - Preserves the original error reference when no mapping occurs (i.e., success branch).
 * - Use for additive refinement without losing upstream error variants.
 */
export const mapErrorUnion =
  /* @__PURE__ */
    <TValue, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (e: TError1) => TError2,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TValue, TError1 | TError2> =>
      r.ok ? r : Err<TValue, TError2>(fn(r.error));

// TODO: mapErrorUnion and mapErrorPreserve allocate a new Err
// TODO: They intentionally create a new Err, which can drop the original error reference and stack/context unless explicitly preserved.
// TODO: Provide a variant that preserves the original error object when the type already matches, or allow a mapper that can return the original value without wrapping.

/**
 * Curried mapper that conditionally preserves the original `Err` object if the mapped error
 * is reference-identical to the original. Otherwise allocates a new `Err`.
 *
 * @typeParam TValue Success value type.
 * @typeParam TError1 Original error type.
 * @typeParam TError2 Mapped error type.
 *
 * @param fn Pure function mapping the original error to a (possibly identical) error value.
 * @returns A function producing a {@link Result} whose error type is widened to `TError1 | TError2`.
 *
 * @remarks
 * - Uses `Object.is` for safe reference equality across potentially disjoint generic types.
 * - Avoids unnecessary allocation when the mapper returns the original error object.
 * - Useful for refinement steps that may no-op.
 */
export const mapErrorPreserve =
  /* @__PURE__ */
    <TValue, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (e: TError1) => TError2,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TValue, TError1 | TError2> => {
      if (r.ok) {
        return r;
      }
      const mapped = fn(r.error);
      return Object.is(mapped, r.error) ? r : Err<TValue, TError2>(mapped);
    };

// TODO: mapErrorUnion and mapErrorPreserve allocate a new Err
// TODO: They intentionally create a new Err, which can drop the original error reference and stack/context unless explicitly preserved.
// TODO: Provide a variant that preserves the original error object when the type already matches, or allow a mapper that can return the original value without wrapping.

/**
 * Curried dual-branch mapper that transforms both success and error sides of a {@link Result}.
 *
 * @typeParam TValue Original success value type.
 * @typeParam TNext Transformed success value type.
 * @typeParam TError1 Original error type.
 * @typeParam TError2 Transformed error type.
 *
 * @param onOk Applied when the result is `Ok`; maps `TValue` to `TNext`.
 * @param onErr Applied when the result is `Err`; maps `TError1` to `TError2`.
 * @returns A function producing a new {@link Result} with transformed branches.
 *
 * @remarks
 * - Allocates exactly one new object in either branch.
 * - Use when both value and error domains must shift together.
 */
export type MapBoth = <
  TValue,
  TNext,
  TError1 extends ErrorLike = AppError,
  TError2 extends ErrorLike = AppError,
>(
  onOk: (v: TValue) => TNext,
  onErr: (e: TError1) => TError2,
) => (r: Result<TValue, TError1>) => Result<TNext, TError2>;

/**
 * Transform both branches of a {@link Result}.
 *
 * @see MapBoth
 */
export const mapBoth: MapBoth =
  /* @__PURE__ */
    (onOk, onErr) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
