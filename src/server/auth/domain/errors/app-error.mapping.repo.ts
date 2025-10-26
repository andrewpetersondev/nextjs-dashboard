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
 * Single source of truth: map repository/domain errors to AppError wrapped in Result.Err.
 * Service layer should route all caught repo errors through this function.
 *
 * Policy:
 * - UnauthorizedError → UNAUTHORIZED (message kept generic for security)
 * - ValidationError → VALIDATION
 * - ConflictError → CONFLICT
 * - ForbiddenError → FORBIDDEN
 * - NotFoundError → NOT_FOUND (rare in auth; prefer Unauthorized for login)
 * - DatabaseError → DATABASE
 * - default/unknown → UNKNOWN (logged for debugging)
 *
 * @typeParam T - The expected success type (never used, only for Result type compatibility)
 * @param err - The caught error from repository layer
 * @param context - Logging context (e.g., "auth-user.service.login")
 * @returns Result.Err with AppError
 */
export function mapRepoErrorToAppResult<T>(
  err: unknown,
  context: string,
): Result<T, AppError> {
  // Domain-first matching
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
  // Infrastructure
  if (err instanceof DatabaseError) {
    return Err(appErrorFromCode("DATABASE", "Database operation failed"));
  }
  // Fallback
  serverLogger.error(
    { context, err, kind: "unexpected" },
    "Unexpected repository error",
  );
  return Err(appErrorFromCode("UNKNOWN", "An unexpected error occurred"));
}
