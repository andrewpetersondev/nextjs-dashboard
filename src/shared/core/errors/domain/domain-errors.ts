import { BaseError } from "@/shared/core/errors/base/base-error";
import { isErrorWithCode } from "@/shared/core/errors/base/error-guards";

/**
 * Input validation failed (HTTP 422 by metadata).
 * Use for schema / semantic validation failures.
 */
export class ValidationError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("validation", { cause, context, message });
  }
}

/**
 * Encapsulates HTTP 404 status with a specific error code.
 * Extends the {@link BaseError} class for standardized error handling.
 */
export class NotFoundError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("NOT_FOUND", { cause, context, message });
  }
}

/**
 * Authentication required or failed (HTTP 401).
 */
export class UnauthorizedError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("UNAUTHORIZED", { cause, context, message });
  }
}

/**
 * Authenticated but lacking permission (HTTP 403).
 */
export class ForbiddenError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("FORBIDDEN", { cause, context, message });
  }
}

/**
 * Resource state conflict (HTTP 409).
 */
export class ConflictError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("CONFLICT", { cause, context, message });
  }
}

/**
 * Narrow unknown to ValidationError.
 * @param e - unknown value
 */
export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;

/**
 * NotFoundError (404 / NOT_FOUND).
 */
export const isNotFoundError = (e: unknown): e is NotFoundError =>
  isErrorWithCode(e, "NOT_FOUND");

/**
 * UnauthorizedError (401 / UNAUTHORIZED).
 */
export const isUnauthorizedError = (e: unknown): e is UnauthorizedError =>
  isErrorWithCode(e, "UNAUTHORIZED");

/**
 * ForbiddenError (403 / FORBIDDEN).
 */
export const isForbiddenError = (e: unknown): e is ForbiddenError =>
  isErrorWithCode(e, "FORBIDDEN");

/**
 * ConflictError (409 / CONFLICT).
 */
export const isConflictError = (e: unknown): e is ConflictError =>
  isErrorWithCode(e, "CONFLICT");
