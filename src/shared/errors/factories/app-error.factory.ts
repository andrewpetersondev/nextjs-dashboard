import {
  APP_ERROR_KEYS,
  type AppErrorKey,
} from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error";
import type {
  AppErrorOptions,
  ErrorMetadata,
} from "@/shared/errors/core/app-error.types";
import type { DbErrorMetadata } from "@/shared/errors/core/app-error-metadata.types";
import {
  buildUnknownValueMetadata,
  safeStringifyUnknown,
} from "@/shared/errors/utils/serialization";

/**
 * Base factory for constructing domain-friendly errors with stable codes.
 *
 * @remarks
 * Ensures all errors have a canonical code and optional metadata for
 * classification and traceability. Prefer specialized factories like
 * {@link makeValidationError} for clarity at call sites.
 */
export function makeAppError(
  code: AppErrorKey,
  options: AppErrorOptions,
): AppError {
  return new AppError(code, options);
}

/**
 * Normalizes any unknown value into an AppError using a fallback code.
 *
 * @remarks
 * Use at integration boundaries to ensure all errors are handled consistently.
 *
 * Ideal for:
 * - Catch blocks at infrastructure boundaries (DAL, HTTP clients)
 * - Wrapping third-party library errors
 * - Action/workflow error recovery
 */
export function normalizeUnknownToAppError(
  error: unknown,
  fallbackCode: AppErrorKey,
): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return makeAppError(fallbackCode, {
      cause: error,
      message: error.message,
      metadata: {},
    });
  }
  return makeAppError(fallbackCode, {
    cause: error,
    message: safeStringifyUnknown(error),
    metadata: buildUnknownValueMetadata(error),
  });
}

/**
 * Wraps an unknown error as an unexpected AppError (invariant violation).
 * This factory:
 * - Normalizes the error via {@link normalizeUnknownToAppError}
 * - Merges provided metadata with normalized metadata
 * - Preserves the original cause chain for debugging
 */
export function makeUnexpectedError(
  error: unknown,
  options: Omit<AppErrorOptions, "cause"> & {
    readonly metadata?: ErrorMetadata;
  },
): AppError {
  const normalized = normalizeUnknownToAppError(
    error,
    APP_ERROR_KEYS.unexpected,
  );

  return makeAppError(APP_ERROR_KEYS.unexpected, {
    cause: normalized.originalCause,
    message: options.message,
    metadata: {
      ...normalized.metadata,
      ...options.metadata,
    },
  });
}

/**
 * Creates a validation-specific AppError for form, schema, or policy validation.
 *
 * @remarks
 * Prefer this over generic {@link makeAppError} at validation boundaries for clarity.
 * TODO: IS THIS USED FOR VALIDATING PARAMETERS? IF IT IS ONLY USED FOR FORMS THEN I SHOULD PROBABLY RENAME IT TO MAKEFORMVALIDATIONERROR AND PLACE IT IN THE SRC/SHARED/FORMS/ FOLDER.
 *
 * Validation errors are **expected failures** and must be returned as `Result.Err`,
 * never thrown.
 *
 * Attach field-level and form-level errors via metadata:
 * - `metadata.fieldErrors`: Map of field names to error messages
 * - `metadata.formErrors`: Array of form-level error messages
 *
 * @example
 * ```ts
 * return Err(makeValidationError({
 *   message: "validation_failed",
 *   metadata: {
 *     fieldErrors: { email: ["Invalid format"] },
 *     formErrors: ["Missing required fields"]
 *   }
 * }));
 * ```
 */
export function makeValidationError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, options);
}

/**
 * Creates a database-specific AppError with required DB metadata.
 * @deprecated: remove because it invites drift when normalize-pg-error.ts is better suited.
 */
export function makeDatabaseError(
  options: Omit<AppErrorOptions, "metadata"> & {
    readonly metadata: DbErrorMetadata & ErrorMetadata;
  },
): AppError {
  return makeAppError(APP_ERROR_KEYS.database, options);
}

/**
 * Creates an integrity-specific AppError for constraint or referential violations.
 *
 * @remarks
 * Use for data integrity issues like:
 * - Unique constraint violations
 * - Foreign key violations
 * - Check constraint failures
 *
 * Treatment depends on context:
 * - **Expected** (e.g., duplicate email on signup): Return as `Result.Err`
 * - **Unexpected** (e.g., broken invariant): Throw
 *
 * @example
 * ```ts
 * // Expected failure (return as value)
 * return Err(makeIntegrityError({
 *   message: "duplicate_email",
 *   metadata: { constraint: "users_email_key", table: "users" }
 * }));
 * ```
 */
export function makeIntegrityError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.integrity, options);
}

/**
 * Creates an infrastructure-specific AppError for technical adapter failures.
 *
 * @remarks
 * Use for expected technical issues at infrastructure boundaries:
 * - Network failures (HTTP clients, external APIs)
 * - Configuration issues (missing env vars, invalid config)
 * - File system errors
 * - External service unavailability
 *
 * Infrastructure errors are **expected failures** and should be returned as
 * `Result.Err` to allow graceful degradation or retry logic.
 *
 * @example
 * ```ts
 * return Err(makeInfrastructureError({
 *   message: "external_service_unavailable",
 *   cause: httpError,
 *   metadata: { service: "payment-gateway", statusCode: 503 }
 * }));
 * ```
 */
export function makeInfrastructureError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.infrastructure, options);
}
