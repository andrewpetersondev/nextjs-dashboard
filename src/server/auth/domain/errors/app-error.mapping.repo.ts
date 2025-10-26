import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Maps repository errors to standardized AppError Results.
 *
 * This is the single source of truth for error translation from the repository
 * layer to the application layer. All service methods should route caught errors
 * through this function to ensure consistent error handling.
 *
 * @typeParam T - The expected success type (for Result type compatibility)
 * @param err - The caught error from repository layer
 * @param context - Logging context identifier (e.g., "auth-user.service.login")
 * @returns Result.Err containing standardized AppError
 *
 * @remarks
 * Error mapping policy:
 * - Domain errors (Unauthorized, Validation, etc.) → Corresponding AppError codes
 * - Infrastructure errors (Database) → Generic messages (hide internals)
 * - Unknown errors → Logged and wrapped as UNKNOWN
 */
export function mapRepoErrorToAppResult<T>(
  err: unknown,
  context: string,
): Result<T, AppError> {
  // Domain-specific errors
  if (err instanceof UnauthorizedError) {
    return Err(appErrorFromCode("UNAUTHORIZED", "Invalid credentials"));
  }

  if (err instanceof ValidationError) {
    return Err(appErrorFromCode("VALIDATION", err.message));
  }

  if (err instanceof ConflictError) {
    return Err(appErrorFromCode("CONFLICT", err.message));
  }

  if (err instanceof ForbiddenError) {
    return Err(appErrorFromCode("FORBIDDEN", err.message));
  }

  if (err instanceof NotFoundError) {
    return Err(appErrorFromCode("NOT_FOUND", err.message));
  }

  // Infrastructure errors - hide internals
  if (err instanceof DatabaseError) {
    serverLogger.error({ context, error: err.message }, "Database error");
    return Err(appErrorFromCode("DATABASE", "Database operation failed"));
  }

  // Unknown/unexpected errors - log for debugging
  serverLogger.error(
    {
      context,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    },
    "Unexpected repository error",
  );

  return Err(appErrorFromCode("UNKNOWN", "An unexpected error occurred"));
}
