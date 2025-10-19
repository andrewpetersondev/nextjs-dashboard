import "server-only";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";
import { Err, type Result } from "@/shared/core/result/result";

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
  serverLogger.error({ context, kind: "unexpected" }, "Unexpected auth error");
  return Err(appErrorFromCode("UNKNOWN"));
}
