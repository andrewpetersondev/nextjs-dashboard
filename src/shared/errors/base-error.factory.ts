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

export function makeUnexpectedError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("unexpected", options);
}

export function makeMissingFieldsError(
  options: BaseErrorOptions = {},
): BaseError {
  return makeBaseError("missingFields", options);
}

export function makeInvalidCredentialsError(
  options: BaseErrorOptions = {},
): BaseError {
  return makeBaseError("invalidCredentials", options);
}

export function makeIntegrityError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("integrity", options);
}

export function makeConflictError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("conflict", options);
}

export function makeDatabaseError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("database", options);
}

export function makeNotFoundError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("notFound", options);
}

export function makeUnauthorizedError(
  options: BaseErrorOptions = {},
): BaseError {
  return makeBaseError("unauthorized", options);
}

export function makeForbiddenError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("forbidden", options);
}

export function makeParseError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("parse", options);
}

export function makeInfrastructureError(
  options: BaseErrorOptions = {},
): BaseError {
  return makeBaseError("infrastructure", options);
}

export function makeUnknownError(options: BaseErrorOptions = {}): BaseError {
  return makeBaseError("unknown", options);
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
