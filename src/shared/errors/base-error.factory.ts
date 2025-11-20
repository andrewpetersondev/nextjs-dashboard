// src/shared/errors/base-error.factory.ts
import { BaseError } from "@/shared/errors/base-error";
import type { BaseErrorOptions } from "@/shared/errors/base-error.types";
import type { AppErrorKey } from "@/shared/errors/error-codes";

/**
 * Canonical factory for creating `BaseError` instances.
 *
 * Use this instead of constructing POJO error shapes.
 */
export function makeBaseError(
  code: AppErrorKey,
  options: BaseErrorOptions = {},
): BaseError {
  return new BaseError(code, options);
}

/**
 * Convenience helpers for common patterns.
 */
export function makeValidationError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("validation", options);
}

/**
 * Type guard that narrows an unknown value to {@link BaseError}.
 *
 * Useful when handling errors from generic `catch` blocks to refine
 * the type before accessing `BaseError`-specific properties.
 *
 * @param error - Unknown value to check.
 * @returns `true` if `e` is a `BaseError`, otherwise `false`.
 */
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}
