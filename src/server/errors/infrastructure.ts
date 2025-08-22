import "server-only";

import { BaseError } from "@/shared/errors/base";

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
