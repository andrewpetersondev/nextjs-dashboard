import "server-only";

/**
 * @remarks Base class error to Replace `AppError`
 *
 * Base class for all application errors.
 * Provides structured error handling with context and HTTP status codes.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-2-error-handling.md
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
