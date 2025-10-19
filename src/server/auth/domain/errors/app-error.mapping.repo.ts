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
 * - UnauthorizedError → UNAUTHORIZED (message kept generic)
 * - ValidationError → VALIDATION
 * - ConflictError → CONFLICT
 * - ForbiddenError → FORBIDDEN
 * - NotFoundError → NOT_FOUND  (rare in auth; prefer Unauthorized for login)
 * - DatabaseError → DATABASE
 * - default/unknown → UNKNOWN (logged)
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
    return Err(appErrorFromCode("VALIDATION"));
  }
  if (err instanceof ConflictError) {
    return Err(appErrorFromCode("CONFLICT"));
  }
  if (err instanceof ForbiddenError) {
    return Err(appErrorFromCode("FORBIDDEN"));
  }
  if (err instanceof NotFoundError) {
    return Err(appErrorFromCode("NOT_FOUND"));
  }
  // Infra
  if (err instanceof DatabaseError) {
    return Err(appErrorFromCode("DATABASE"));
  }
  // Fallback
  serverLogger.error(
    { context, kind: "unexpected" },
    "Unexpected repository error",
  );
  return Err(appErrorFromCode("UNKNOWN"));
}
