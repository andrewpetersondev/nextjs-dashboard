import {
  APP_ERROR_KEYS,
  type AppErrorKey,
} from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error";
import type {
  AppErrorOptions,
  ErrorMetadata,
  UnexpectedErrorOptions,
} from "@/shared/errors/core/app-error.types";
import { redactNonSerializable } from "@/shared/errors/utils/serialization";

function buildUnknownValueMetadata(
  value: unknown,
  extra: ErrorMetadata = {},
): ErrorMetadata {
  return {
    ...extra,
    originalType: value === null ? "null" : typeof value,
    originalValue: redactNonSerializable(value),
  };
}

function safeStringifyUnknown(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }
    const json = JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    const MaxLength = 10_000;
    if (json.length > MaxLength) {
      return `${json.slice(0, MaxLength)}…[truncated ${json.length - MaxLength} chars]`;
    }
    return json ?? String(value);
  } catch {
    return "Non-serializable thrown value";
  }
}

/**
 * Base factory for constructing domain-friendly errors with stable codes.
 *
 * @remarks
 * Ensures all errors have a canonical code and metadata for
 * classification and traceability. Call sites must provide an explicit
 * metadata object (use `{}` when no additional details are available).
 *
 * Prefer more specific error factories at feature or boundary layers
 * (for example, validation- or infrastructure-focused helpers) to make
 * intent clearer at call sites.
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
 * Use at non-Postgres infrastructure boundaries to ensure all errors are
 * handled consistently:
 * - HTTP clients
 * - File system operations
 * - Third-party SDKs
 *
 * For Postgres, always prefer `normalizePgError` from the Postgres adapter
 * layer so intrinsic database metadata (`pgCode`, `constraint`, `table`, etc.)
 * and condition mapping are preserved.
 *
 * Ideal for:
 * - Catch blocks at infrastructure boundaries (DAL for non-PG stores, HTTP clients)
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
 *
 * @remarks
 * - Normalizes the error via {@link normalizeUnknownToAppError}.
 * - Merges provided metadata with normalized metadata.
 * - Preserves the original cause chain for debugging.
 *
 * Callers MUST provide a `metadata` object, even when empty (`{}`), to keep
 * intent explicit and avoid silent defaults.
 */
export function makeUnexpectedError(
  error: unknown,
  options: UnexpectedErrorOptions,
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
 * Validation errors are **expected failures** and must be returned as `Result.Err`,
 * never thrown.
 *
 * Attach field-level and form-level errors via metadata:
 * - `metadata.fieldErrors`: Map of field names to error messages
 * - `metadata.formErrors`: Array of form-level error messages
 */
export function makeValidationError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, options);
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
 */
export function makeInfrastructureError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.infrastructure, options);
}
