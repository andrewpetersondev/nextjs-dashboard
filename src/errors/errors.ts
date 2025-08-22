import { BaseError } from "@/errors/errors-base";
import { DatabaseError_New, ValidationError_New } from "@/errors/errors-domain";

/**
 * Deprecated: Use `BaseError` and domain-specific errors instead.
 * This shim preserves backward compatibility with code importing `AppError`.
 */
export class AppError extends BaseError {
  /**
   * Backward-compatibility: Retain a public `details` bag if existing code reads it.
   */
  public readonly details?: unknown;

  private readonly _code: string;
  readonly statusCode: number = 500;

  /**
   * @deprecated Prefer extending `BaseError` subclasses with explicit codes/status.
   */
  constructor(message: string, code: string = "APP_ERROR", details?: unknown) {
    super(message, toContext(details));
    this._code = code;
    this.details = details;
    this.name = new.target.name;
  }

  get code(): string {
    return this._code;
  }
}

/**
 * Deprecated: Use `ValidationError_New` instead.
 */
export class ValidationError extends ValidationError_New {
  public readonly details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message, toContext(details));
    this.details = details;
    this.name = new.target.name;
  }
}

/**
 * Deprecated: Use `DatabaseError_New` instead.
 */
export class DatabaseError extends DatabaseError_New {
  public readonly details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message, toContext(details));
    this.details = details;
    this.name = new.target.name;
  }
}

function toContext(details?: unknown): Record<string, unknown> {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    return details as Record<string, unknown>;
  }
  return details === undefined ? {} : { details };
}
