import "server-only";
import { BaseError } from "@/shared/core/errors/base/base-error";

/**
 * Generic infrastructure failure (storage, network, system).
 * Code: INFRASTRUCTURE (HTTP/status/severity derived from metadata).
 */
export class InfrastructureError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("INFRASTRUCTURE", message, context, cause);
  }
}

/**
 * Database operation failure (query/connection/transaction).
 * Code: DATABASE.
 */
export class DatabaseError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("DATABASE", message, context, cause);
  }
}

/**
 * Cache layer failure (read/write/serialization/connectivity).
 * Code: CACHE.
 */
export class CacheError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("CACHE", message, context, cause);
  }
}

/**
 * Cryptographic operation failure (hash/encrypt/decrypt/key mgmt).
 * Code: CRYPTO.
 */
export class CryptoError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("CRYPTO", message, context, cause);
  }
}
