import { BaseError } from "@/shared/core/errors/base";

/**
 * Wrapper for unexpected / unmapped thrown values.
 * Always uses code `UNKNOWN` to allow safe, generic client messaging.
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
