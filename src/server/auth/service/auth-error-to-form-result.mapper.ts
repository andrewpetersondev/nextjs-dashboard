// File: src/server/forms/auth-error-to-form-result.mapper.ts

import "server-only";
import type { AuthServiceError } from "@/server/auth/service/auth-errors";
import { setSingleFieldErrorMessage } from "@/shared/forms/errors/dense-error-map.setters";
import { toFormValidationErr } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { FormResult } from "@/shared/forms/types/form-result.types";

// Narrow map and avoid defaulting twice; centralize fallback.
const FALLBACK_MESSAGE = "Something went wrong. Please try again." as const;

/**
 * Maps an AuthServiceError to a FormResult validation error.
 *
 * - Conflicts target the "email" field by convention for signup flows.
 * - Missing fields target the first provided field (usually "email").
 * - Unexpected errors attach to a special "form" pseudo-field when present in `fields`,
 *   otherwise fall back to the first field.
 */
export function authErrorToFormResult<TField extends string>(
  fields: readonly TField[],
  error: AuthServiceError,
  raw: Readonly<Record<string, unknown>>,
): FormResult<TField, unknown> {
  const messageByKind: Readonly<Record<AuthServiceError["kind"], string>> = {
    conflict: "Email or username already in use.",
    invalid_credentials: "Invalid email or password.",
    missing_fields: "Please fill in all required fields.",
    unexpected: FALLBACK_MESSAGE,
    validation: "Please correct the highlighted fields.",
  };

  // Prefer specific target fields commonly present in signup flows; otherwise fall back to first.
  const preferredField: TField | undefined =
    (["email", "username", "form"].find((f) => fields.includes(f as TField)) as
      | TField
      | undefined) ?? fields[0];

  const dense: DenseFieldErrorMap<TField, string> = setSingleFieldErrorMessage<
    TField,
    string
  >(fields, messageByKind[error.kind] ?? FALLBACK_MESSAGE, {
    field: preferredField,
  });

  return toFormValidationErr<TField, unknown>({
    failureMessage: messageByKind[error.kind] ?? FALLBACK_MESSAGE,
    fieldErrors: dense,
    fields,
    raw,
  });
}
