import type { AppError } from "@/shared/errors/app-error/app-error";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/constants/messages";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/factories/error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/form-result.factory";
import {
  getFieldErrors,
  getFieldValues,
} from "@/shared/forms/domain/guards/form-guards";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { selectDisplayableStringFieldValues } from "@/shared/forms/state/mappers/display-values.mapper";
import type { Result } from "@/shared/result/result";

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
export function mapResultToFormResult<Tfield extends string, Tpayload>(
  result: Result<Tpayload, AppError>,
  params: {
    fields: readonly Tfield[];
    raw: Record<string, unknown>;
    failureMessage?: string;
    redactFields?: readonly Tfield[];
    successMessage?: string;
  },
): FormResult<Tpayload> {
  const {
    successMessage = FORM_SUCCESS_MESSAGES.successMessage,
    failureMessage = FORM_ERROR_MESSAGES.validationFailed,
    raw,
    fields,
    redactFields = ["password" as Tfield],
  } = params;

  if (result.ok) {
    return formOk<Tpayload>(result.value, successMessage);
  }

  // Extract field errors from AppError.details or create empty dense map
  const fieldErrors =
    getFieldErrors<Tfield>(result.error) ??
    createEmptyDenseFieldErrorMap<Tfield, string>(fields);

  // Try to preserve existing values from error, fallback to computing from raw
  const values =
    getFieldValues<Tfield>(result.error) ??
    selectDisplayableStringFieldValues(raw, fields, redactFields);

  return formError<Tfield>({
    fieldErrors,
    message: result.error.message || failureMessage,
    values,
  });
}
