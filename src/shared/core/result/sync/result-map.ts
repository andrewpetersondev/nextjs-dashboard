// src/shared/core/result/result-map.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/sync/result";

/**
 * Map the success value of a Result (error branch untouched).
 * @template TValue Success value input.
 * @template TNext Success value output.
 * @template TError Error type (carried through).
 */
export type MapOk = <TValue, TNext, TError extends ErrorLike = AppError>(
  fn: (v: TValue) => TNext,
) => (r: Result<TValue, TError>) => Result<TNext, TError>;

/** Pure success mapper. */
export const mapOk: MapOk =
  /* @__PURE__ */
    (fn) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? Ok(fn(r.value)) : r;

/**
 * Replace the error type (original error type is not retained).
 * Use when you want to strictly transform Err<TError1> -> Err<TError2>.
 * @template TValue Success type.
 * @template TError1 Original error type.
 * @template TError2 New error type.
 */
export type MapError = <
  TValue,
  TError1 extends ErrorLike = AppError,
  TError2 extends ErrorLike = AppError,
>(
  fn: (e: TError1) => TError2,
) => (r: Result<TValue, TError1>) => Result<TValue, TError2>;

/** Standard error mapping (replacement). */
export const mapError: MapError =
  /* @__PURE__ */
    (fn) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? r : Err(fn(r.error));

/**
 * Widen the error type to include both the original and mapped error types.
 * Useful when preserving original error variants for callers without losing newly mapped refinements.
 * @template TValue Success type.
 * @template TError1 Original error type.
 * @template TError2 Added error type.
 */
export const mapErrorUnion =
  /* @__PURE__ */
    <TValue, TError1 extends ErrorLike, TError2 extends ErrorLike>(
      fn: (e: TError1) => TError2,
    ) =>
    /* @__PURE__ */
    (r: Result<TValue, TError1>): Result<TValue, TError1 | TError2> =>
      r.ok ? r : Err<TValue, TError2>(fn(r.error));

/**
 * Identity‑preserving error map.
 * - If the mapper returns the exact same reference, the original Err object is reused.
 * - Otherwise returns a freshly allocated Err with the mapped error.
 * The resulting error type is widened (union) to remain sound across identity preservation.
 * @template TValue Success type.
 * @template TError1 Original error type.
 * @template TError2 Mapped error type (may be different / non-overlapping).
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
      // Reference identity check (safe even for disjoint types).
      // Use Object.is to avoid TS2367 false-positive on === between disjoint generics.
      return Object.is(mapped, r.error) ? r : Err<TValue, TError2>(mapped);
    };

/**
 * Map both branches simultaneously.
 * @template TValue Original success type.
 * @template TNext New success type.
 * @template TError1 Original error.
 * @template TError2 New error.
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

/** Transform both branches. */
export const mapBoth: MapBoth =
  /* @__PURE__ */
    (onOk, onErr) =>
    /* @__PURE__ */
    (r) =>
      r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
