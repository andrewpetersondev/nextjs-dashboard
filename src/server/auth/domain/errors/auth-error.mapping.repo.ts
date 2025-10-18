import "server-only";
import { createAuthServiceError } from "@/server/auth/domain/errors/auth-error.factories";
import type { AuthError } from "@/server/auth/domain/errors/auth-error.model";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import { Err, type Result } from "@/shared/core/result/result";

export function mapRepoErrorToAuthResult<T>(
  err: unknown,
  context: string,
): Result<T, AuthError> {
  if (err instanceof ConflictError) {
    return Err(createAuthServiceError("conflict"));
  }
  if (err instanceof UnauthorizedError) {
    return Err(createAuthServiceError("invalid_credentials"));
  }
  if (err instanceof ValidationError) {
    return Err(createAuthServiceError("validation"));
  }
  serverLogger.error({ context, kind: "unexpected" }, "Unexpected auth error");
  return Err(createAuthServiceError("unexpected"));
}
