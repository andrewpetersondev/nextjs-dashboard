// File: src/shared/core/result/result-sync.ts
import {
  type AppError,
  type ErrorLike,
  normalizeUnknownError,
} from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/sync/result";

/**
 * Execute a synchronous function and wrap its result in a Result.
 * Overloads enforce mapper presence when customizing error type.
 * @template TValue Success value type.
 * @template TError Error type (defaults to AppError when mapper omitted).
 * @param fn Synchronous thunk.
 * @param mapError Optional error mapper (required for custom error type).
 * @returns Result wrapping value or normalized error.
 */
export function tryCatch<TValue>(fn: () => TValue): Result<TValue, AppError>;
export function tryCatch<TValue, TError extends ErrorLike>(
  fn: () => TValue,
  mapError: (e: unknown) => TError,
): Result<TValue, TError>;
export function tryCatch<TValue, TError extends ErrorLike>(
  fn: () => TValue,
  mapError?: (e: unknown) => TError,
): Result<TValue, AppError | TError> {
  try {
    return Ok(fn());
  } catch (e) {
    return mapError ? Err(mapError(e)) : Err(normalizeUnknownError(e));
  }
}

/**
 * Wrap a nullable value.
 * @template TValue
 * @template TError
 * @param v Possibly null/undefined value.
 * @param onNull Error factory when nullish.
 * @returns Ok when value present; Err otherwise.
 */
export const fromNullable = <TValue, TError extends ErrorLike = AppError>(
  v: TValue | null | undefined,
  onNull: () => TError,
): Result<TValue, TError> => (v == null ? Err(onNull()) : Ok(v));

/**
 * Guard a value by predicate.
 * @template TValue
 * @template TError
 * @param value Input value.
 * @param predicate Boolean test.
 * @param onFail Error factory when predicate fails.
 * @returns Result wrapping original value or failure.
 */
export const fromPredicate = <TValue, TError extends ErrorLike = AppError>(
  value: TValue,
  predicate: (v: TValue) => boolean,
  onFail: (v: TValue) => TError,
): Result<TValue, TError> =>
  predicate(value) ? Ok(value) : Err(onFail(value));
