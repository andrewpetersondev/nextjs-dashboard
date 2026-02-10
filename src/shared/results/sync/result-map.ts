import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import type {
  MapBoth,
  MapError,
  MapOk,
} from "@/shared/results/sync/result-sync.types";

/**
 * Transforms the value of an `Ok` result using the provided function, maintaining the `Err` state otherwise.
 *
 * @typeParam T - The input success value type.
 * @typeParam U - The output success value type.
 * @typeParam E - The error type, constrained to `AppError`.
 * @param fn - A function to apply to the `Ok` result's value.
 * @returns A function that maps a `Result<T, E>` to `Result<U, E>`.
 * @example
 * const result = mapOk((x) => x * 2)({ ok: true, value: 10 });
 * // result: { ok: true, value: 20 }
 */
export const mapOk: MapOk =
  /* @__PURE__ */
  // biome-ignore lint/nursery/useExplicitType: fix
    (fn) =>
    /* @__PURE__ */
    // biome-ignore lint/nursery/useExplicitType: fix
    (r) =>
      r.ok ? Ok(fn(r.value)) : r;

/**
 * Maps an error value using the provided function if the result is an error.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The mapped error type.
 * @param fn - A function that transforms the error value.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E2>`.
 * @example
 * const result = mapError((err) => ({ code: 'E', message: err.message }))(Err({ code: 'X', message: 'Failed' }));
 */
export const mapError: MapError =
  /* @__PURE__ */
  // biome-ignore lint/nursery/useExplicitType: fix
    (fn) =>
    /* @__PURE__ */
    // biome-ignore lint/nursery/useExplicitType: fix
    (r) =>
      r.ok ? r : Err(fn(r.error));

/**
 * Maps an error of type `E1` to a new error of type `E2` within a `Result`.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The mapped error type.
 * @param fn - A function transforming `E1` into `E2`.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E1 | E2>`.
 */
export const mapErrorUnion =
  /* @__PURE__ */
    <T, E1 extends AppError, E2 extends AppError>(fn: (e: E1) => E2) =>
    /* @__PURE__ */
    (r: Result<T, E1>): Result<T, E1 | E2> =>
      r.ok ? r : Err(fn(r.error));

/**
 * Maps an error from a `Result` type to a new error type while preserving the original error instance
 * if the mapping returns the very same instance.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The mapped error type.
 * @param fn - A transformation function to map the error from `E1` to `E2`.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E1 | E2>`, preserving the original `Err` object when unchanged.
 */
export const mapErrorPreserve =
  /* @__PURE__ */
    <T, E1 extends AppError, E2 extends AppError>(fn: (e: E1) => E2) =>
    /* @__PURE__ */
    (r: Result<T, E1>): Result<T, E1 | E2> => {
      if (r.ok) {
        return r;
      }
      const mapped = fn(r.error);
      return Object.is(mapped, r.error) ? r : Err(mapped);
    };

/**
 * Alias for `mapErrorPreserve`.
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const mapErrorUnionPreserve = mapErrorPreserve;

/**
 * Transforms both the success (`Ok`) and error (`Err`) states of a result.
 *
 * @typeParam T - The type of the success value.
 * @typeParam U - The type after transforming the success value.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The transformed error type.
 * @param onOk - Function to map the success (`Ok`) value.
 * @param onErr - Function to map the error (`Err`) value.
 * @returns A function that takes a result and transforms it using the provided mappings.
 * @example
 * const result = mapBoth(
 *   (value) => value.toUpperCase(),
 *   (error) => ({ code: 'MSG', message: error.message })
 * )({ ok: true, value: "hello" }); // Output: { ok: true, value: "HELLO" }
 */
export const mapBoth: MapBoth =
  /* @__PURE__ */
  // biome-ignore lint/nursery/useExplicitType: fix
    (onOk, onErr) =>
    /* @__PURE__ */
    // biome-ignore lint/nursery/useExplicitType: fix
    (r) =>
      r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
