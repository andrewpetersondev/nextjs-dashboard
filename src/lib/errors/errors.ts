/**
 * Base application error.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "APP_ERROR",
    public details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Ensure correct prototype
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor); // Better stack traces
  }
}

/**
 * Validation error for user input.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
  }
}

/**
 * Database error for persistence issues.
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "DATABASE_ERROR", details);
  }
}

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

export class ValidationError_New extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
}
