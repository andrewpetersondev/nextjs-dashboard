// src/server/auth/logging/auth-logging.mappers.ts
import "server-only";
import { AuthServiceLogFactory } from "@/server/auth/logging/auth-logging.contexts";
import type {
  AuthOperation,
  AuthServiceLog,
} from "@/server/auth/logging/auth-logging.types";
import type { AppError } from "@/shared/result/app-error/app-error";
import type { Result } from "@/shared/result/result";

export function mapAuthResultToServiceLog<T>(
  operation: AuthOperation,
  result: Result<T, AppError>,
  identifiers?: AuthServiceLog["identifiers"],
): AuthServiceLog {
  if (result.ok) {
    return AuthServiceLogFactory.success(operation, identifiers);
  }

  const code = result.error.code;

  // Map validation errors (including invalid credentials which are modeled
  // as a ValidationError / code "validation") to a validation-kind log.
  if (code === "validation") {
    return AuthServiceLogFactory.validation(operation, identifiers);
  }

  // All other error codes (conflict, infrastructure, database, etc.)
  // are treated as exceptions at the service layer.
  return AuthServiceLogFactory.exception(operation, identifiers, result.error);
}
