import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/core/constants";
import {
  type FormResult,
  formError,
  formOk,
  getFieldErrors,
  getFieldValues,
} from "@/shared/forms/core/types";
import { selectDisplayableStringFieldValues } from "@/shared/forms/state/mappers/display-values.mapper";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";

/**
 * Maps a domain `Result` to a UI-facing `FormResult`.
 *
 * Use this to convert domain-layer results (like authentication or business logic)
 * into form-aware results that can be consumed by UI components.
 *
 * @param result - Discriminated `Result` with either success data or AppError.
 * @param params - Adapter options for messages and value echoing/redaction.
 * @returns FormResult with success value or validation error.
 */
export function mapResultToFormResult<TField extends string, TPayload>(
  result: Result<TPayload, AppError>,
  params: {
    fields: readonly TField[];
    raw: Record<string, unknown>;
    failureMessage?: string;
    redactFields?: readonly TField[];
    successMessage?: string;
  },
): FormResult<TPayload> {
  const {
    successMessage = FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw,
    fields,
    redactFields = ["password" as TField],
  } = params;

  if (result.ok) {
    return formOk<TPayload>(result.value, successMessage);
  }

  // Extract field errors from AppError.details or create empty dense map
  const fieldErrors =
    getFieldErrors<TField>(result.error) ??
    createEmptyDenseFieldErrorMap<TField, string>(fields);

  // Try to preserve existing values from error, fallback to computing from raw
  const values =
    getFieldValues<TField>(result.error) ??
    selectDisplayableStringFieldValues(raw, fields, redactFields);

  return formError<TField>({
    fieldErrors,
    message: result.error.message || failureMessage,
    values,
  });
}
