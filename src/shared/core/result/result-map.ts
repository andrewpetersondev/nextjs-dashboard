// File: src/shared/core/result/result-map.ts
import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Map success branch.
 * @template TValue
 * @template TNext
 * @template TError
 */
export const mapOk =
  /* @__PURE__ */
    <TValue, TNext, TError extends ErrorLike = AppError>(
      fn: (v: TValue) => TNext,
    ) =>
    (r: Result<TValue, TError>): Result<TNext, TError> =>
      r.ok ? Ok(fn(r.value)) : r;

/**
 * Map the error branch to a new error type.
 * Sound implementation (no unsafe casts / TS2352). Always allocates a new Err when the
 * source Result is an error. Micro-optimization (identity preservation) removed to keep
 * type safety when TError2 differs from TError1.
 *
 * @template TValue Success value type.
 * @template TError1 Original error type.
 * @template TError2 Mapped error type.
 * @param fn Error mapping function.
 * @returns Function that transforms Result<TValue,TError1> into Result<TValue,TError2>.
 */
export const mapError =
  /* @__PURE__ */
    <
      TValue,
      TError1 extends ErrorLike = AppError,
      TError2 extends ErrorLike = AppError,
    >(
      fn: (e: TError1) => TError2,
    ) =>
    (r: Result<TValue, TError1>): Result<TValue, TError2> => {
      if (r.ok) {
        // Ok branch is structurally compatible with any error type parameter.
        return r;
      }
      return Err(fn(r.error));
    };

/**
 * Map both branches.
 * @template TValue
 * @template TNext
 * @template TError1
 * @template TError2
 */
export const mapBoth =
  /* @__PURE__ */
    <
      TValue,
      TNext,
      TError1 extends ErrorLike = AppError,
      TError2 extends ErrorLike = AppError,
    >(
      onOk: (v: TValue) => TNext,
      onErr: (e: TError1) => TError2,
    ) =>
    (r: Result<TValue, TError1>): Result<TNext, TError2> =>
      r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
