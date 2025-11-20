import { BaseError } from "@/shared/errors/base-error";
import type {
  BaseErrorOptions,
  ErrorContext,
} from "@/shared/errors/base-error.types";
import { APP_ERROR_MAP, type AppErrorCode } from "@/shared/errors/error-codes";

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
