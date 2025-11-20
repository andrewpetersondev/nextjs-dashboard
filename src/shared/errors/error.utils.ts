// src/shared/errors/error.utils.ts
import { BaseError } from "@/shared/errors/base-error";
import type { ErrorContext } from "@/shared/errors/base-error.types";
import type { AppErrorKey } from "@/shared/errors/error-codes";

/**
 * Normalize an unknown value into a BaseError using {@link BaseError.from}.
 *
 * This is the preferred entry-point for converting arbitrary thrown values
 * into the canonical `BaseError` type.
 */
export function normalizeToBaseError(
  error: unknown,
  fallbackCode: AppErrorKey = "unknown",
): BaseError {
  return BaseError.from(error, fallbackCode);
}

/**
 * Typed helper that normalizes failures into BaseError.
 *
 * Use this for new async code paths where you want a tuple-style result:
 * `[value, null]` on success, `[null, BaseError]` on failure.
 */
export async function _catchAsyncBase<T>(
  fn: () => Promise<T>,
  fallbackCode: AppErrorKey = "unknown",
): Promise<[T, null] | [null, BaseError]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, normalizeToBaseError(error, fallbackCode)];
  }
}

/**
 * Wrapper that rethrows normalized BaseError,
 * preserving the original as cause and attaching context.
 *
 * This is the preferred wrapper for async boundaries.
 */
export function _wrapAsyncBase<T extends unknown[], R>(
  code: AppErrorKey,
  fn: (...args: T) => Promise<R>,
  baseContext: ErrorContext = {},
  message?: string,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (err) {
      throw BaseError.wrap(code, err, baseContext, message);
    }
  };
}
