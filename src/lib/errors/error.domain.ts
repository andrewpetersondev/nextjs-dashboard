import "server-only";
import { BaseError } from "@/lib/errors/error.base";

/**
 * Validation error representation with code and status.
 *
 * Extends {@link BaseError} to provide a standardized validation error with
 * HTTP status code 400.
 *
 * @remarks
 * Immutable; use to encapsulate validation errors in APIs or services.
 */
export class ValidationError_New extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
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
export class NotFoundError_New extends BaseError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;
}

/**
 * Represents an unauthorized error.
 *
 * Extends {@link BaseError} to provide standardized properties for HTTP 401 errors.
 */
export class UnauthorizedError_New extends BaseError {
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
export class ForbiddenError_New extends BaseError {
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
export class ConflictError_New extends BaseError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;
}

/**
 * Represents a database error with a fixed code and status.
 *
 * Extends {@link BaseError} to provide a standardized error structure.
 *
 * @remarks
 * - Always uses the error code "DATABASE_ERROR".
 * - The HTTP status code is fixed at 500.
 * - Intended for server-side database-related exceptions.
 *
 * @example
 * ```typescript
 * throw new DatabaseError_New("Database connection failed.");
 * ```
 */
export class DatabaseError_New extends BaseError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;
}

/**
 * Represents an error specific to cache operations.
 *
 * Inherits from {@link BaseError} and includes a fixed error code and status code.
 *
 * @extends BaseError
 */
export class CacheError_New extends BaseError {
  readonly code = "CACHE_ERROR";
  readonly statusCode = 500;
}

/**
 * Represent a cryptographic operation error.
 *
 * Extends {@link BaseError} to provide consistent error structure for cryptographic failures.
 *
 * @remarks
 * - `code` is fixed as `"CRYPTO_ERROR"`.
 * - `statusCode` is fixed as `500`.
 * - Used to signal cryptographic operation issues within the application.
 *
 * @example
 * ```typescript
 * throw new CryptoError_New("Encryption failed due to invalid key length.");
 * ```
 */
export class CryptoError_New extends BaseError {
  readonly code = "CRYPTO_ERROR";
  readonly statusCode = 500;
}
