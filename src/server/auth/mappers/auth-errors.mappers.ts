// File: src/server/auth/mappers/auth-errors.mappers.ts
import "server-only";
import type { AuthServiceError } from "@/server/auth/user-auth.service";
import type { AppError } from "@/shared/core/result/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import type { FormResult } from "@/shared/forms/types/form-result.types";

export const mapErrorToAuthServiceUnexpected = (e: {
  readonly message?: string;
}): AuthServiceError => ({
  kind: "unexpected",
  message: e.message ?? "Unexpected error",
});

export function authServiceErrorToAppError(e: AuthServiceError): AppError {
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

export function authServiceErrorToFormResult<TField extends string, TData>(p: {
  readonly fields: readonly TField[];
  readonly raw: Readonly<Record<string, unknown>>;
  readonly error: AuthServiceError;
  readonly conflictEmailField?: TField;
}): FormResult<TField, TData> {
  const appErr = authServiceErrorToAppError(p.error);
  return appErrorToFormResult<TField, TData>({
    conflictEmailField: p.conflictEmailField,
    error: appErr,
    fields: p.fields,
    raw: p.raw,
  });
}
