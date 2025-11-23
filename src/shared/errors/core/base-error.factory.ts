// src/shared/errors/core/base-error.factory.ts
import { BaseError } from "@/shared/errors/core/base-error";
import type { BaseErrorOptions } from "@/shared/errors/core/base-error.types";
import type { AppErrorKey } from "@/shared/errors/core/error-codes";

/**
 * Canonical factory for creating `BaseError` instances.
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

export function makeUnexpectedError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("unexpected", options);
}

export function makeIntegrityError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("integrity", options);
}

/**
 * Type guard for narrowing to `BaseError`.
 */
export function isBaseError(error: unknown): error is BaseError {
  return BaseError.isBaseError(error);
}
