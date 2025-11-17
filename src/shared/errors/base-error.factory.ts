// src/shared/errors/base-error.factory.ts
import { BaseError, type BaseErrorOptions } from "@/shared/errors/base-error";
import type { ErrorCode } from "@/shared/errors/error-codes";

/**
 * Canonical factory for creating `BaseError` instances.
 *
 * Use this instead of constructing POJO error shapes.
 */
export function makeBaseError(
  code: ErrorCode,
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

export function makeConflictError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("conflict", options);
}

export function makeUnexpectedError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("unknown", options);
}
