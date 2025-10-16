import "server-only";
import { mapAuthServiceErrorToAppError } from "@/server/auth/application/mappers/auth-service-error.to-app-error.mapper";
import type { AuthServiceError } from "@/server/auth/domain/errors/auth-service.error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
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
export function authServiceErrorToFormResult<TField extends string>(
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
