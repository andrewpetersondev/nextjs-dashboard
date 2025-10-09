// File: src/server/forms/auth-error-to-form-result.mapper.ts

import "server-only";
import type { AuthServiceError } from "@/server/auth/user-auth.service";
import { setSingleFieldErrorMessage } from "@/shared/forms/errors/dense-error-map.setters";
import { toFormValidationErr } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { FormResult } from "@/shared/forms/types/form-result.type";

export function authErrorToFormResult<TField extends string>(
  fields: readonly TField[],
  error: AuthServiceError,
  raw: Readonly<Record<string, unknown>>,
): FormResult<TField, unknown> {
  const messageByKind: Record<AuthServiceError["kind"], string> = {
    conflict: "Email or username already in use.",
    invalid_credentials: "Invalid email or password.",
    missing_fields: "Please fill in all required fields.",
    unexpected: "Something went wrong. Please try again.",
    validation: "Please correct the highlighted fields.",
  };

  const dense: DenseFieldErrorMap<TField> = setSingleFieldErrorMessage<TField>(
    fields,
    messageByKind[error.kind] ?? "Something went wrong.",
    {
      field:
        error.kind === "missing_fields"
          ? ("email" as TField)
          : ("form" as TField),
    },
  );

  return toFormValidationErr<TField, unknown>({
    failureMessage: messageByKind[error.kind] ?? "Something went wrong.",
    fieldErrors: dense,
    fields,
    raw,
  });
}
