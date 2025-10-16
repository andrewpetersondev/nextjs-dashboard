import "server-only";
import type { AuthActionError } from "@/server/auth/domain/errors/auth-service.error";
import { toUnexpectedAuthServiceErrorNormalized } from "@/server/auth/domain/errors/auth-service.error";
import type { AppError } from "@/shared/core/result/app-error";

export const toUnexpectedAuthServiceError = (e: unknown): AuthActionError =>
  toUnexpectedAuthServiceErrorNormalized(e);

export function mapAuthServiceErrorToAppError(e: AuthActionError): AppError {
  switch (e.kind) {
    case "conflict":
      return {
        code: "CONFLICT",
        details: { column: "email", fields: ["email"] as const },
        message: e.message,
      };
    case "validation":
      return { code: "VALIDATION", message: e.message };
    case "invalid_credentials":
      return { code: "UNAUTHORIZED", message: e.message };
    case "missing_fields":
      return {
        code: "VALIDATION",
        details: { fields: e.fields },
        message: e.message,
      };
    default:
      return { code: "UNKNOWN", message: e.message };
  }
}
