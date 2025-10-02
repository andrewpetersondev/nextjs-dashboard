import "server-only";
import { BaseError } from "@/shared/core/errors/base";

// Keep InfrastructureError opaque and non-serializable beyond code.
export class InfrastructureError extends BaseError {
  // Make code a string literal type, but allow subclasses to override with their own literals.
  // Use a widened readonly string (not a literal) to avoid locking subclasses to "INFRASTRUCTURE_ERROR".
  readonly code: string = "INFRASTRUCTURE_ERROR";
  readonly statusCode = 500;

  // Use a private brand field to avoid "used before its declaration".
  private static readonly brand: unique symbol = Symbol("InfrastructureError");
  private readonly __brand: typeof InfrastructureError.brand =
    InfrastructureError.brand;

  constructor(
    message = "Infrastructure failure",
    context: Record<string, unknown> = {},
    cause?: Error,
  ) {
    super(message, context, cause);
  }

  // Redact sensitive details; only expose code.
  toJSON(): Record<string, unknown> {
    return { code: this.code };
  }
}

/**
 * Represents a database error with a fixed code and status.
 *
 * Extends InfrastructureError to keep a single infra hierarchy.
 */
export class DatabaseError extends InfrastructureError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;

  constructor(
    message = "Database operation failed",
    context: Record<string, unknown> = {},
    cause?: Error,
  ) {
    super(message, context, cause);
  }
}

/**
 * Represents an error specific to cache operations.
 */
export class CacheError extends InfrastructureError {
  readonly code = "CACHE_ERROR";
  readonly statusCode = 500;

  constructor(
    message = "Cache operation failed",
    context: Record<string, unknown> = {},
    cause?: Error,
  ) {
    super(message, context, cause);
  }
}

/**
 * Represents a cryptographic operation error.
 */
export class CryptoError extends InfrastructureError {
  readonly code = "CRYPTO_ERROR";
  readonly statusCode = 500;

  constructor(
    message = "Cryptographic operation failed",
    context: Record<string, unknown> = {},
    cause?: Error,
  ) {
    super(message, context, cause);
  }
}
