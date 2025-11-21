// File: src/shared/core/result/sync/result-map.ts

import type { BaseError } from "@/shared/errors/core/base-error";
import { Err, Ok, type Result } from "@/shared/result/result";

/**
 * @alpha
 * A utility type for applying a transformation function to a successful `Result` value.
 *
 * @typeParam Tvalue - The type of the input value in the `Result`.
 * @typeParam Tnext - The type of the transformed value.
 * @typeParam Terror - The type of the error, defaults to `BaseError`.
 *
 * @param fn - A transformation function to be applied to the `Tvalue`.
 * @returns A function that takes a `Result` and produces a transformed `Result`.
 */
export type MapOk = <Tvalue, Tnext, Terror extends BaseError>(
  fn: (v: Tvalue) => Tnext,
) => (r: Result<Tvalue, Terror>) => Result<Tnext, Terror>;

/**
 * Transforms the value of an `Ok` result using the provided function, maintaining the `Err` state otherwise.
 *
 * @alpha
 * @param fn - A function to apply to the `Ok` result's value.
 * @returns A new result with the transformed value if `Ok`, or the unchanged result if `Err`.
 * @example
 * const result = mapOk((x) => x * 2)({ ok: true, value: 10 });
 * // result: { ok: true, value: 20 }
 */
export const mapOk: MapOk =
  /* @__PURE__ */
    (fn) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? Ok(fn(r.value)) : r;

/**
 * Transforms the error type of a `Result` using a mapping function.
 *
 * @typeParam Tvalue - The type of the successful result.
 * @typeParam Terror1 - The original error type, defaults to `BaseError`.
 * @typeParam Terror2 - The mapped error type, defaults to `BaseError`.
 * @param fn - A function that maps from `Terror1` to `Terror2`.
 * @returns A function that takes a `Result` and returns a transformed `Result`.
 */
export type MapError = <
  Tvalue,
  Terror1 extends BaseError,
  Terror2 extends BaseError,
>(
  fn: (e: Terror1) => Terror2,
) => (r: Result<Tvalue, Terror1>) => Result<Tvalue, Terror2>;

/**
 * Maps an error value using the provided function if the result is an error.
 *
 * @param fn - A function that transforms the error value.
 * @returns A new result with the transformed error or the original success.
 * @example
 * const result = mapError((err) => `Error: ${err}`)(Err("Failed"));
 * // Result: Err("Error: Failed")
 * @public
 */
export const mapError: MapError =
  /* @__PURE__ */
    (fn) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? r : Err(fn(r.error));

/**
 * Maps an error of type `Terror1` to a new error of type `Terror2` within a `Result`.
 *
 * @alpha
 * @typeParam Tvalue - The type of the value in the `Result` if it is successful.
 * @typeParam Terror1 - The type of the original error in the `Result`.
 * @typeParam Terror2 - The type of the new mapped error.
 * @param fn - A function transforming `Terror1` into `Terror2`.
 * @returns A new `Result` with a mapped error if the original `Result` contained an error.
 */
export const mapErrorUnion =
  /* @__PURE__ */
    <Tvalue, Terror1 extends BaseError, Terror2 extends BaseError>(
      fn: (e: Terror1) => Terror2,
    ) =>
    /* @__PURE__ */
    (r: Result<Tvalue, Terror1>): Result<Tvalue, Terror1 | Terror2> =>
      r.ok ? r : Err(fn(r.error));

/**
 * Maps an error from a `Result` type to a new error type while preserving the original error type if unchanged.
 *
 * @alpha
 * @typeParam Tvalue - The value type of the `Result`.
 * @typeParam Terror1 - The original error type of the `Result`.
 * @typeParam Terror2 - The mapped error type after applying the transformation function.
 * @param fn - A transformation function to map the error from `Terror1` to `Terror2`.
 * @returns A `Result` where the error type is a union of `Terror1` and `Terror2`.
 */
export const mapErrorUnionPreserve =
  /* @__PURE__ */
    <Tvalue, Terror1 extends BaseError, Terror2 extends BaseError>(
      fn: (e: Terror1) => Terror2,
    ) =>
    /* @__PURE__ */
    (r: Result<Tvalue, Terror1>): Result<Tvalue, Terror1 | Terror2> => {
      if (r.ok) {
        return r;
      }
      const mapped = fn(r.error);
      return Object.is(mapped, r.error) ? r : Err(mapped);
    };

/**
 * Maps an error in a `Result` using a provided function, preserving the original error
 * if the mapping function returns the same error instance.
 *
 * @param fn - A function that transforms one error type into another.
 * @returns A function that takes a `Result` and applies the error mapping if the `Result` is not ok.
 * @typeParam Tvalue - The type of the value in the `Result`.
 * @typeParam Terror1 - The initial error type.
 * @typeParam Terror2 - The transformed error type.
 * @example
 * const result = mapErrorPreserve(fn)(Result.err(new Error("Original")));
 */
export const mapErrorPreserve =
  /* @__PURE__ */
    <Tvalue, Terror1 extends BaseError, Terror2 extends BaseError>(
      fn: (e: Terror1) => Terror2,
    ) =>
    /* @__PURE__ */
    (r: Result<Tvalue, Terror1>): Result<Tvalue, Terror1 | Terror2> => {
      if (r.ok) {
        return r;
      }
      const mapped = fn(r.error);
      return Object.is(mapped, r.error) ? r : Err(mapped);
    };

/**
 * Transforms both success and error states of a {@link Result} type using the provided functions.
 *
 * @typeParam Tvalue - The type of the success value.
 * @typeParam Tnext - The type of the transformed success value.
 * @typeParam Terror1 - The type of the initial error, extending `BaseError`. Defaults to `BaseError`.
 * @typeParam Terror2 - The type of the transformed error, extending `BaseError`. Defaults to `BaseError`.
 * @param onOk - A function to transform the success value.
 * @param onErr - A function to transform the error value.
 * @returns A new {@link Result} with the transformed success or error value.
 */
export type MapBoth = <
  Tvalue,
  Tnext,
  Terror1 extends BaseError,
  Terror2 extends BaseError,
>(
  onOk: (v: Tvalue) => Tnext,
  onErr: (e: Terror1) => Terror2,
) => (r: Result<Tvalue, Terror1>) => Result<Tnext, Terror2>;

/**
 * Transforms both the success (`Ok`) and error (`Err`) states of a result.
 *
 * @typeParam T - The type of the success value.
 * @typeParam E - The type of the error value.
 * @typeParam U - The type after transforming the success value.
 * @typeParam F - The type after transforming the error value.
 * @param onOk - Function to map the success (`Ok`) value.
 * @param onErr - Function to map the error (`Err`) value.
 * @returns A function that takes a result and transforms it using the provided mappings.
 * @example
 * const result = mapBoth(
 *   (value) => value.toUpperCase(),
 *   (error) => error.message
 * )({ ok: true, value: "hello" }); // Output: { ok: true, value: "HELLO" }
 */
export const mapBoth: MapBoth =
  /* @__PURE__ */
    (onOk, onErr) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
