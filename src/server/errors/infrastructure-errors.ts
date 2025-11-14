import "server-only";
import {
  BaseError,
  type ErrorContext,
} from "@/shared/core/errors/base/base-error";
import {
  ERROR_CODES,
  type ErrorCode,
} from "@/shared/core/errors/base/error-codes";

/**
 * Generic infrastructure failure (storage, network, system).
 * Code: INFRASTRUCTURE (HTTP/status/severity derived from metadata).
 */
export class InfrastructureError extends BaseError {
  constructor(message?: string, context: ErrorContext = {}, cause?: unknown) {
    super(ERROR_CODES.infrastructure.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }
}

/**
 * Database operation failure (query/connection/transaction).
 * Code: DATABASE.
 */
export class DatabaseError extends BaseError {
  constructor(message?: string, context: ErrorContext = {}, cause?: unknown) {
    super(ERROR_CODES.database.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }
}
