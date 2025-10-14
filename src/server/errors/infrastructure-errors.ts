import "server-only";
import { BaseError } from "@/shared/core/errors/base/base-error";

/**
 * Generic infrastructure failure (storage, network, system).
 * Code: INFRASTRUCTURE (HTTP/status/severity derived from metadata).
 */
export class InfrastructureError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    // Adapt to BaseError(options) signature
    super("INFRASTRUCTURE", { cause, context, message });
  }
}

/**
 * Database operation failure (query/connection/transaction).
 * Code: DATABASE.
 */
export class DatabaseError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("DATABASE", { cause, context, message });
  }
}

/**
 * Cache layer failure (read/write/serialization/connectivity).
 * Code: CACHE.
 */
export class CacheError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("CACHE", { cause, context, message });
  }
}

/**
 * Cryptographic operation failure (hash/encrypt/decrypt/key mgmt).
 * Code: CRYPTO.
 */
export class CryptoError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("CRYPTO", { cause, context, message });
  }
}
