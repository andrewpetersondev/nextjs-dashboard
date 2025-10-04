import { BaseError } from "@/shared/core/errors/base";

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
 * Represents a "Not Found" error.
 *
 * Encapsulates HTTP 404 status with a specific error code.
 * Extends the {@link BaseError} class for standardized error handling.
 *
 * @remarks
 * - This error type is immutable and contains a readonly `code` and `statusCode`.
 * - Use this class to represent missing resources or invalid endpoints.
 *
 * @example
 * ```typescript
 * const error = new NotFoundError_New("Resource not found.");
 * console.error(error.code); // "NOT_FOUND"
 * console.error(error.statusCode); // 404
 * ```
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
