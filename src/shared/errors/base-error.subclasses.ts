import { BaseError } from "@/shared/errors/base-error";
import type {
  BaseErrorOptions,
  ErrorContext,
} from "@/shared/errors/base-error.types";
import { ERROR_CODES, type ErrorCode } from "@/shared/errors/error-codes";

/**
 * Input validation failed (HTTP 422 by metadata).
 * Use for schema / semantic validation failures.
 */
export class ValidationError extends BaseError {
  constructor(message?: string, context?: ErrorContext, cause?: unknown) {
    super(ERROR_CODES.validation.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }

  /**
   * Ensure `withContext`/`remap` can safely reconstruct this subclass.
   *
   * - For the canonical validation code, return a new `ValidationError`.
   * - For any other code, fall back to a plain `BaseError`.
   */
  protected override create(code: ErrorCode, options: BaseErrorOptions): this {
    if (code !== ERROR_CODES.validation.name) {
      return new BaseError(code, options) as this;
    }
    return new ValidationError(
      options.message,
      options.context,
      options.cause,
    ) as this;
  }
}

/**
 * Generic infrastructure failure (storage, network, system).
 * Code: INFRASTRUCTURE (HTTP/status/severity derived from metadata).
 */
export class InfrastructureError extends BaseError {
  constructor(message?: string, context?: ErrorContext, cause?: unknown) {
    super(ERROR_CODES.infrastructure.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }

  protected override create(code: ErrorCode, options: BaseErrorOptions): this {
    if (code !== ERROR_CODES.infrastructure.name) {
      return new BaseError(code, options) as this;
    }
    return new InfrastructureError(
      options.message,
      options.context,
      options.cause,
    ) as this;
  }
}

/**
 * Database operation failure (query/connection/transaction).
 * Code: DATABASE.
 */
export class DatabaseError extends BaseError {
  constructor(message?: string, context?: ErrorContext, cause?: unknown) {
    super(ERROR_CODES.database.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }

  protected override create(code: ErrorCode, options: BaseErrorOptions): this {
    if (code !== ERROR_CODES.database.name) {
      return new BaseError(code, options) as this;
    }
    return new DatabaseError(
      options.message,
      options.context,
      options.cause,
    ) as this;
  }
}
