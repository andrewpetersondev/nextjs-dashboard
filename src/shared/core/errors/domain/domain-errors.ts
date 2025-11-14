import { BaseError } from "@/shared/core/errors/base/base-error";

/**
 * Input validation failed (HTTP 422 by metadata).
 * Use for schema / semantic validation failures.
 */
export class ValidationError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("validation", { cause, context, message });
  }
}

/**
 * Encapsulates HTTP 404 status with a specific error code.
 * Extends the {@link BaseError} class for standardized error handling.
 */
export class NotFoundError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("notFound", { cause, context, message });
  }
}

/**
 * Authentication required or failed (HTTP 401).
 */
export class UnauthorizedError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("unauthorized", { cause, context, message });
  }
}

/**
 * Authenticated but lacking permission (HTTP 403).
 */
export class ForbiddenError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("forbidden", { cause, context, message });
  }
}

/**
 * Resource state conflict (HTTP 409).
 */
export class ConflictError extends BaseError {
  constructor(
    message?: string,
    context: Readonly<Record<string, unknown>> = {},
    cause?: unknown,
  ) {
    super("conflict", { cause, context, message });
  }
}

/**
 * Narrow unknown to ValidationError.
 * @param e - unknown value
 */
export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;
