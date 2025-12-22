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

/**
 * Base factory for constructing domain-friendly errors with stable codes.
 *
 * @remarks
 * Ensures all errors have a canonical code and optional metadata for
 * classification and traceability. Prefer specialized factories like
 * {@link makeValidationError} or {@link makeDatabaseError} for clarity
 * at call sites.
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
 * This function delegates to {@link AppError.from} which already implements
 * the normalization logic—no need to duplicate.
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
  return AppError.from(error, fallbackCode);
}

/**
 * Wraps an unknown error as an unexpected AppError with contextual metadata.
 *
 * @remarks
 * Use this for programmer errors, invariant violations, or impossible states
 * that should **never** occur in normal operation. These are typically **thrown**
 * rather than returned as `Result.Err`.
 *
 * This factory:
 * - Normalizes the error via {@link normalizeUnknownToAppError}
 * - Merges provided metadata with normalized metadata
 * - Preserves the original cause chain for debugging
 *
 * @example
 * ```ts
 * if (!session) {
 *   throw makeUnexpectedErrorFromUnknown(
 *     new Error("Session missing after validation"),
 *     {
 *       message: "Invariant violation: session must exist",
 *       metadata: { operation: "establishSession" }
 *     }
 *   );
 * }
 * ```
 */
export function makeUnexpectedError(
  error: unknown,
  options: Omit<AppErrorOptions, "cause"> & {
    readonly metadata?: ErrorMetadata;
  },
): AppError {
  const normalizedError = normalizeUnknownToAppError(
    error,
    APP_ERROR_KEYS.unexpected,
  );

  return makeAppError(APP_ERROR_KEYS.unexpected, {
    cause: normalizedError.originalCause,
    message: options.message,
    metadata: {
      ...normalizedError.metadata,
      ...(options.metadata ?? {}),
    },
  });
}

/**
 * Creates a validation-specific AppError for form, schema, or policy validation.
 *
 * @remarks
 * Prefer this over generic {@link makeAppError} at validation boundaries for clarity.
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
 *
 * @remarks
 * Use this for database failures like query errors, timeouts, or constraint violations.
 * Must be used with normalization utilities (e.g., `normalizePgError`) at the
 * infrastructure boundary to map vendor-specific errors.
 *
 * Database errors are **expected failures** and must be returned as `Result.Err`.
 *
 * Required metadata fields:
 * - `table`: The database table involved
 * - `operation`: The operation being performed (e.g., "insert", "select")
 * - `constraint`: Optional constraint name for violations
 * - `pgCode`: Postgres error code (for PG adapters)
 *
 * @example
 * ```ts
 * return Err(makeDatabaseError({
 *   message: "db_unique_violation",
 *   cause: pgError,
 *   metadata: {
 *     table: "users",
 *     operation: "insert",
 *     constraint: "users_email_key",
 *     pgCode: "23505"
 *   }
 * }));
 * ```
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
