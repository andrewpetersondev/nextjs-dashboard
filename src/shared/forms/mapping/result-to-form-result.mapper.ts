import type { Result } from "@/shared/core/result/sync/result";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import { selectDisplayableStringFieldValues } from "@/shared/forms/mapping/display-values.selector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type {
  FormError,
  FormResult,
  FormSuccess,
} from "@/shared/forms/types/form-state.type";

/**
 * @public
 * Represents validation errors for specific fields.
 *
 * @typeParam TFieldNames - The type of field names used in the validation.
 * @property message - A descriptive error message.
 * @property fieldErrors - A mapped collection of errors for individual fields.
 */
export interface FormValidationResult<TFieldNames extends string> {
  readonly message: string;
  readonly fieldErrors: DenseFieldErrorMap<TFieldNames>;
}

/**
 * Maps a `Result` object to a corresponding `FormResult` object.
 *
 * @param result - The operation result containing either data or validation errors.
 * @param params - Configuration parameters including success/failure messages, raw field values, and field names.
 * @returns A `FormResult` containing success data or validation error details.
 */
export function mapResultToFormResult<TFieldNames extends string, TData>(
  result: Result<TData, FormValidationResult<TFieldNames>>,
  params: {
    successMessage?: string;
    failureMessage?: string;
    raw: Record<string, unknown>;
    fields: readonly TFieldNames[];
    redactFields?: readonly TFieldNames[];
  },
): FormResult<TFieldNames, TData> {
  const {
    successMessage = FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw,
    fields,
    redactFields = ["password" as TFieldNames],
  } = params;

  if (result.ok) {
    const value: FormSuccess<TData> = {
      data: result.value,
      message: successMessage,
    };
    return { ok: true, value };
  }

  const error: FormError<TFieldNames> = {
    fieldErrors: result.error.fieldErrors,
    kind: "validation",
    message: result.error.message || failureMessage,
    values: selectDisplayableStringFieldValues(raw, fields, redactFields),
  };
  return { error, ok: false };
}

/**
 * Converts data into a FormResult object representing a successful form operation.
 *
 * @typeParam TFieldNames - The type of field names used in the form.
 * @typeParam TData - The type of data contained in the form result.
 * @param data - The data to include in the form result.
 * @param opts - Optional configuration, including a success message.
 * @returns A `FormResult` object with a success status and the provided data.
 */
export function toFormOk<TFieldNames extends string, TData>(
  data: TData,
  opts: {
    readonly successMessage?: string;
  } = {},
): FormResult<TFieldNames, TData> {
  const value: FormSuccess<TData> = {
    data,
    message: opts.successMessage ?? FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
  };
  return { ok: true, value };
}

/**
 * Converts provided field errors and additional metadata into a standardized form validation error.
 *
 * @param params - The configuration object containing field errors, optional failure message, raw data,
 *                 specific fields to include, and fields to redact.
 * @returns A `FormResult` object containing a validation error with the processed details.
 */
export function toFormValidationErr<TFieldNames extends string, TData>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldNames>;
  readonly failureMessage?: string;
  readonly raw?: Record<string, unknown>;
  readonly fields?: readonly TFieldNames[];
  readonly redactFields?: readonly TFieldNames[];
}): FormResult<TFieldNames, TData> {
  const {
    fieldErrors,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw = {},
    fields = [] as const,
    redactFields = ["password" as TFieldNames],
  } = params;

  const error: FormError<TFieldNames> = {
    fieldErrors,
    kind: "validation",
    message: failureMessage,
    values:
      fields.length > 0
        ? selectDisplayableStringFieldValues(raw, fields, redactFields)
        : undefined,
  };
  return { error, ok: false };
}
