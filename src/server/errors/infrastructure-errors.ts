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
    super("infrastructure", { cause, context, message });
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
    super("database", { cause, context, message });
  }
}
