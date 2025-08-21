import "server-only";

/**
 * Abstract base class for custom errors with structured metadata.
 *
 * Provides a consistent interface for error handling with additional context,
 * status codes, timestamps, and JSON serialization.
 *
 * @abstract
 * @property code - Unique error identifier.
 * @property statusCode - HTTP-like status code for the error.
 * @property timestamp - Date when the error was instantiated.
 * @param message - Error message description.
 * @param context - Additional metadata to provide context (default: empty object).
 * @param cause - Optional root cause error.
 * @example
 * ```typescript
 * class NotFoundError extends BaseError {
 *   readonly code = "NOT_FOUND";
 *   readonly statusCode = 404;
 * }
 *
 * const error = new NotFoundError("Resource not found", { resourceId: 123 });
 * console.error(error.toJSON());
 * ```
 */
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
    cause?: Error,
  ) {
    // Use native cause when available
    super(message, { cause });
    this.name = new.target.name;
    this.timestamp = new Date();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  toJSON(): Record<string, unknown> {
    const causeMsg =
      (this as unknown as { cause?: unknown })?.cause instanceof Error
        ? (this as unknown as { cause: Error }).cause.message
        : undefined;

    return {
      code: this.code,
      context: this.context,
      message: this.message,
      name: this.name,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(causeMsg && { cause: causeMsg }),
    };
  }
}
