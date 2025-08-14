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
