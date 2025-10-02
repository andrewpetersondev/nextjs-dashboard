import { BaseError } from "@/shared/core/errors/base";

/**
 * Fallback error for unexpected / unmapped failures.
 *
 * Used when an unknown value or a native Error that is not already a BaseError
 * is encountered. Wraps the original cause (if any) without leaking stack traces
 * across boundaries (callers can use toJSON()).
 */
export class UnknownError extends BaseError {
  constructor(
    message?: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super("UNKNOWN", message, context, cause);
  }
}
