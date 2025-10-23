/**
 * This file is now deprecated.
 *
 * The service layer now returns form-aware errors with fieldErrors
 * pre-normalized in details. Actions use toFormError() directly.
 *
 * This adapter remains for backward compatibility with legacy code paths
 * or non-auth errors that still need conversion.
 */
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { type FormResult, formError } from "@/shared/forms/core/types";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types";
import { selectDisplayableStringFieldValues } from "@/shared/forms/state/mappers/display-values.mapper";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";

/**
 * Legacy adapter for non-form-aware errors.
 * Prefer service layer normalization via toFormAwareError() in new code.
 */
export function appErrorToFormResult<TField extends string>(
  error: AppError,
  params: {
    readonly fields: readonly TField[];
    readonly raw: Readonly<Record<string, unknown>>;
    readonly redactFields?: readonly TField[];
    readonly defaultMessage?: string;
  },
): FormResult<never> {
  const {
    fields,
    raw,
    redactFields = ["password" as TField],
    defaultMessage = "Request failed. Please try again.",
  } = params;

  // If already form-aware, use its details
  if (error.details?.fieldErrors) {
    const values = selectDisplayableStringFieldValues(
      raw,
      fields,
      redactFields,
    );
    return formError<TField>({
      fieldErrors: error.details.fieldErrors as DenseFieldErrorMap<
        TField,
        string
      >,
      message: error.message || defaultMessage,
      values,
    });
  }

  // Fallback: create empty dense map
  const dense = createEmptyDenseFieldErrorMap(fields);

  const values = selectDisplayableStringFieldValues(raw, fields, redactFields);

  return formError<TField>({
    fieldErrors: dense,
    message: error.message || defaultMessage,
    values,
  });
}
