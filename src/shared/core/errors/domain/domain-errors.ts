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
