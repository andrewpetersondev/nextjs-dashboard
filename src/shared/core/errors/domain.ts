import { BaseError } from "@/shared/core/errors/base";

/**
 * Validation error representation with code and status.
 *
 * Extends {@link BaseError} to provide a standardized validation error with
 * HTTP status code 400.
 *
 * @remarks
 * Immutable; use to encapsulate validation errors in APIs or services.
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
 * Represents an unauthorized error.
 *
 * Extends {@link BaseError} to provide standardized properties for HTTP 401 errors.
 */
export class UnauthorizedError extends BaseError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;
}

/**
 * Represents a "Forbidden" error with HTTP status code 403.
 *
 * Extends the {@link BaseError} class to standardize forbidden access errors.
 *
 * @remarks
 * This error is used when a user attempts an action they are unauthorized to perform.
 *
 * @example
 * ```typescript
 * throw new ForbiddenError_New("Access denied to resource.");
 * ```
 */
export class ForbiddenError extends BaseError {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;
}

/**
 * Conflict error for HTTP 409 responses.
 *
 * Represents a resource conflict scenario, such as duplicate data submission.
 *
 * @remarks
 * Extends {@link BaseError} and sets the HTTP status code to 409.
 */
export class ConflictError extends BaseError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;
}
