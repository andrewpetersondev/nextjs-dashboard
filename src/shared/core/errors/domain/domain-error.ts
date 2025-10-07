import { BaseError } from "@/shared/core/errors/base/base-error";

/**
 * Input validation failed (HTTP 422 by metadata).
 * Use for schema / semantic validation failures.
 */
export class ValidationError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("VALIDATION", message, context, cause);
  }
}

/**
 * Encapsulates HTTP 404 status with a specific error code.
 * Extends the {@link BaseError} class for standardized error handling.
 */
export class NotFoundError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("NOT_FOUND", message, context, cause);
  }
}

/**
 * Authentication required or failed (HTTP 401).
 */
export class UnauthorizedError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("UNAUTHORIZED", message, context, cause);
  }
}

/**
 * Authenticated but lacking permission (HTTP 403).
 */
export class ForbiddenError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("FORBIDDEN", message, context, cause);
  }
}

/**
 * Resource state conflict (HTTP 409).
 */
export class ConflictError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("CONFLICT", message, context, cause);
  }
}

/**
 * Wrapper for unexpected / unmapped thrown values.
 * Always uses code `UNKNOWN` to allow safe, generic client messaging.
 */
export class UnknownError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("UNKNOWN", message, context, cause);
  }
}
