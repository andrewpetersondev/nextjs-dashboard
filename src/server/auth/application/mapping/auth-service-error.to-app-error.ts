import "server-only";
import type { AuthServiceError } from "@/server/auth/domain/errors/auth-service.error";
import type { AppError } from "@/shared/core/result/app-error";

export const toUnexpectedAuthServiceError = (e: unknown): AuthServiceError => ({
  kind: "unexpected",
  message: String(e),
});

export const toUnexpectedAuthServiceErrorFromMessage = (e: {
  readonly message?: string;
}): AuthServiceError => ({
  kind: "unexpected",
  message: e.message ?? "Unexpected error",
});

export function mapAuthServiceErrorToAppError(e: AuthServiceError): AppError {
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
