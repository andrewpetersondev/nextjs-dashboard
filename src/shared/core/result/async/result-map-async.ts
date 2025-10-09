// File: src/shared/core/result/async/result-map-async.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Ok, type Result } from "@/shared/core/result/result";

/**
 * Map the Ok branch of a `Result` using an async transformer.
 *
 * - If `r.ok === true`, awaits `fn(r.value)` and returns `Ok<TNext>`.
 * - If `r.ok === false`, returns the original `Err` unchanged.
 *
 * Pure, curried helper; does not catch exceptions from `fn`.
 *
 * @typeParam TValue - Input Ok value type.
 * @typeParam TNext - Output Ok value type after transformation.
 * @typeParam TError - Error type propagated unchanged.
 * @param fn - Async transformer applied to the Ok value.
 * @returns Function that maps a `Result<TValue, TError>` to `Promise<Result<TNext, TError>>`.
 * @example
 * const toUpper = mapOkAsync((s: string) => Promise.resolve(s.toUpperCase()));
 * const r = await toUpper(Ok("x")); // → { ok: true, value: "X" }
 * @remarks - Forwards exceptions thrown inside the async mapper
 */
export const mapOkAsync =
  /* @__PURE__ */
    <TValue, TNext, TError extends ErrorLike = AppError>(
      fn: (v: TValue) => Promise<TNext>,
    ) =>
    /* @__PURE__ */
    async (r: Result<TValue, TError>): Promise<Result<TNext, TError>> =>
      r.ok ? Ok(await fn(r.value)) : r;

// TODO: mapOkAsync doesn’t catch exceptions
// TODO: It forwards exceptions thrown inside the async mapper, violating the Result-no-throw discipline. Consider a “safe” variant or docs warning plus a tryCatchAsync wrapper option.

// TODO: Missing safe async mappers
// TODO: No mapOkAsyncSafe/flatMapAsyncSafe that catches mapper exceptions into Err via normalizeUnknownError.
// TODO: These are often needed at boundaries.
