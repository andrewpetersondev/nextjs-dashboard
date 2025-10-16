// File: src/server/auth/mappers/auth-service-errors.mapper.ts
import "server-only";
import type { AuthServiceError } from "@/server/auth/domain/errors/auth-service.error";
import type { AppError } from "@/shared/core/result/app-error";

// --- Mappers ---

export const mapUnknownToAuthServiceError = (e: unknown): AuthServiceError => ({
  kind: "unexpected",
  message: String(e),
});

// rare?
export const mapToUnexpectedAuthServiceError = (e: {
  readonly message?: string;
}): AuthServiceError => ({
  kind: "unexpected",
  message: e.message ?? "Unexpected error",
});

// auth service errors -> app errors
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

// --- Handlers ---
