import { BaseError } from "@/shared/errors/base-error";
import type {
  BaseErrorOptions,
  ErrorContext,
} from "@/shared/errors/base-error.types";
import { APP_ERROR_MAP, type AppErrorCode } from "@/shared/errors/error-codes";

/**
 * Input validation failed (HTTP 422 by metadata).
 * Use for schema / semantic validation failures.
 * @deprecated new strategy avoids subclassing for common cases
 */
export class ValidationError extends BaseError {
  constructor(message?: string, context?: ErrorContext, cause?: unknown) {
    super(APP_ERROR_MAP.validation.name satisfies AppErrorCode, {
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
  protected override create(
    code: AppErrorCode,
    options: BaseErrorOptions,
  ): this {
    if (code !== APP_ERROR_MAP.validation.name) {
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
 * Database operation failure (query/connection/transaction).
 * Code: database
 * @deprecated new strategy avoids subclassing for common cases
 *
 */
export class DatabaseError extends BaseError {
  constructor(message?: string, context?: ErrorContext, cause?: unknown) {
    super(APP_ERROR_MAP.database.name satisfies AppErrorCode, {
      cause,
      context,
      message,
    });
  }

  protected override create(
    code: AppErrorCode,
    options: BaseErrorOptions,
  ): this {
    if (code !== APP_ERROR_MAP.database.name) {
      return new BaseError(code, options) as this;
    }
    return new DatabaseError(
      options.message,
      options.context,
      options.cause,
    ) as this;
  }
}
