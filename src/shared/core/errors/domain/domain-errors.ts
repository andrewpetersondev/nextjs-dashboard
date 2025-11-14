import {
  BaseError,
  type ErrorContext,
} from "@/shared/core/errors/base/base-error";
import {
  ERROR_CODES,
  type ErrorCode,
} from "@/shared/core/errors/base/error-codes";

/**
 * Input validation failed (HTTP 422 by metadata).
 * Use for schema / semantic validation failures.
 */
export class ValidationError extends BaseError {
  constructor(message?: string, context: ErrorContext = {}, cause?: unknown) {
    super(ERROR_CODES.validation.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }
}

/**
 * Resource state conflict (HTTP 409).
 */
export class ConflictError extends BaseError {
  constructor(message?: string, context: ErrorContext = {}, cause?: unknown) {
    super(ERROR_CODES.conflict.name satisfies ErrorCode, {
      cause,
      context,
      message,
    });
  }
}
