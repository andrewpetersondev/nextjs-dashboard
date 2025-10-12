// File: src/server/auth/mappers/auth-service-errors.mappers.ts
import "server-only";
import type { AuthServiceError } from "@/server/auth/service/user-auth.service";
import type { AppError } from "@/shared/core/result/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import type { FormResult } from "@/shared/forms/types/form-result.types";

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

// auth service errors -> form result
export function mapAuthServiceErrorToFormResult<
  TField extends string,
  TData,
>(p: {
  readonly fields: readonly TField[];
  readonly raw: Readonly<Record<string, unknown>>;
  readonly error: AuthServiceError;
  readonly conflictEmailField?: TField;
}): FormResult<TField, TData> {
  const appErr = mapAuthServiceErrorToAppError(p.error);
  return appErrorToFormResult<TField, TData>({
    conflictEmailField: p.conflictEmailField,
    error: appErr,
    fields: p.fields,
    raw: p.raw,
  });
}

// --- Handlers ---

// identify auth service error
export function handleAuthServiceError<TField extends string>(
  fields: readonly TField[],
  raw: Readonly<Record<string, unknown>>,
  e: AuthServiceError,
) {
  switch (e.kind) {
    case "conflict":
      // Map specific conflicting field (email by default)
      return mapAuthServiceErrorToFormResult<TField, unknown>({
        conflictEmailField: "email" as TField,
        error: e,
        fields,
        raw,
      });
    case "missing_fields":
      // Prefer validation shape with missing fields highlighted by adapter
      return mapAuthServiceErrorToFormResult<TField, unknown>({
        error: e,
        fields,
        raw,
      });
    case "validation":
      // Validation errors propagated; adapter preserves field-level details
      return mapAuthServiceErrorToFormResult<TField, unknown>({
        error: e,
        fields,
        raw,
      });
    case "invalid_credentials":
      // Surface a user-friendly message without field targeting
      return mapAuthServiceErrorToFormResult<TField, unknown>({
        error: { ...e, message: e.message || "Invalid credentials" },
        fields,
        raw,
      });
    case "unexpected":
      // Fallback to a safe generic failure message
      return mapAuthServiceErrorToFormResult<TField, unknown>({
        error: { ...e, message: e.message || "Unexpected error" },
        fields,
        raw,
      });
    default: {
      // Compile-time exhaustiveness guard if AuthServiceError changes
      const _exhaustive: never = e as never;
      return mapAuthServiceErrorToFormResult<TField, unknown>({
        error: _exhaustive,
        fields,
        raw,
      });
    }
  }
}
