// File: src/shared/forms/mappers/result-to-form.mapper.ts

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
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types";
import { selectDisplayableStringFieldValues } from "@/shared/forms/state/mappers/display-values.mapper";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";

/**
 * Maps a domain `Result` to a UI-facing `FormResult`.
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

/**
 * Create a UI-facing success `FormResult` from data.
 */
export function toFormOk<TPayload>(
  data: TPayload,
  opts: {
    readonly successMessage?: string;
  } = {},
): FormResult<TPayload> {
  const message = opts.successMessage ?? FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE;
  return formOk<TPayload>(data, message);
}

/**
 * Build a UI-facing validation error `FormResult` with optional redacted echo of submitted values.
 */
export function toFormError<TField extends string>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TField, string>;
  readonly failureMessage?: string;
  readonly fields?: readonly TField[];
  readonly raw?: Record<string, unknown>;
  readonly redactFields?: readonly TField[];
}): FormResult<never> {
  const {
    fieldErrors,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw = {},
    fields = [] as const,
    redactFields = ["password" as TField],
  } = params;

  const values =
    fields.length > 0
      ? selectDisplayableStringFieldValues(raw, fields, redactFields)
      : undefined;

  return formError<TField>({
    fieldErrors,
    message: failureMessage,
    values,
  });
}
