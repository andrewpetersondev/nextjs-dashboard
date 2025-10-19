import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import { setSingleFieldErrorMessage } from "@/shared/forms/errors/dense-error-map.setters";
import { toFormValidationErr } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { FormResult } from "@/shared/forms/types/form-result.types";

const FALLBACK_MESSAGE = "Something went wrong. Please try again." as const;

/** Keep helper for direct AppError -> FormResult conversions when needed. */
export function authServiceErrorToFormResult<TField extends string>(
  fields: readonly TField[],
  error: AppError,
  raw: Readonly<Record<string, unknown>>,
): FormResult<TField, unknown> {
  // Fallback: attach message to a preferred field if details not provided.
  const preferredField: TField | undefined =
    (["email", "username", "form"].find((f) => fields.includes(f as TField)) as
      | TField
      | undefined) ?? fields[0];

  const dense: DenseFieldErrorMap<TField, string> = setSingleFieldErrorMessage<
    TField,
    string
  >(fields, error.message || FALLBACK_MESSAGE, {
    field: preferredField,
  });

  return toFormValidationErr<TField, unknown>({
    failureMessage: error.message || FALLBACK_MESSAGE,
    fieldErrors: dense,
    fields,
    raw,
  });
}

// AppError -> FormResult
export function mapAuthServiceErrorToFormResult<
  TField extends string,
  TData,
>(p: {
  readonly fields: readonly TField[];
  readonly raw: Readonly<Record<string, unknown>>;
  readonly error: AppError;
  readonly conflictEmailField?: TField;
}): FormResult<TField, TData> {
  return appErrorToFormResult<TField, TData>({
    conflictEmailField: p.conflictEmailField,
    error: p.error,
    fields: p.fields,
    raw: p.raw,
  });
}
