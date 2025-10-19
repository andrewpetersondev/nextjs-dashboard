import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";
import { Err, type Result } from "@/shared/core/result/result";

/**
 * Single source of truth: map repository/domain errors to AppError wrapped in Result.Err.
 * Service layer should route all caught repo errors through this function.
 */
export function mapRepoErrorToAppResult<T>(
  err: unknown,
  context: string,
): Result<T, AppError> {
  if (err instanceof ConflictError) {
    return Err(appErrorFromCode("CONFLICT"));
  }
  if (err instanceof UnauthorizedError) {
    return Err(appErrorFromCode("UNAUTHORIZED"));
  }
  if (err instanceof ValidationError) {
    return Err(appErrorFromCode("VALIDATION"));
  }
  if (err instanceof DatabaseError) {
    return Err(appErrorFromCode("DATABASE"));
  }
  serverLogger.error({ context, kind: "unexpected" }, "Unexpected auth error");
  return Err(appErrorFromCode("UNKNOWN"));
}
