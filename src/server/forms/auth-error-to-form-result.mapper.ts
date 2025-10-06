import type { AuthServiceError } from "@/server/auth/user-auth.service";
import { setSingleFieldErrorMessage } from "@/shared/forms/errors/dense-error-map.setters";
import { toFormValidationErr } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-state.type";

export function authErrorToFormResult<TField extends string>(
  fields: readonly TField[],
  error: AuthServiceError,
  raw: Readonly<Record<string, unknown>>,
): FormResult<TField, unknown> {
  // Minimal UX mapping; tune messages per kind if needed
  const messageByKind: Record<AuthServiceError["kind"], string> = {
    conflict: "Email or username already in use.",
    invalid_credentials: "Invalid email or password.",
    missing_fields: "Please fill all required fields.",
    unexpected: "Unexpected error. Please try again.",
    validation: "Invalid data. Check the form and try again.",
  };

  const dense = setSingleFieldErrorMessage(
    fields,
    messageByKind[error.kind] ?? "Something went wrong.",
  );
  return toFormValidationErr<TField, unknown>({
    fieldErrors: dense,
    fields,
    raw,
  });
}
