/**
 * Base application error.
 * @remarks - To be replaced with `BaseError`
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "APP_ERROR",
    public details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Validation error for user input.
 * @remarks - To be replaced with `ValidationError_New`
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
  }
}

/**
 * Database error for persistence issues.
 * @remarks - To be replaced with `DatabaseError_New`
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "DATABASE_ERROR", details);
  }
}
