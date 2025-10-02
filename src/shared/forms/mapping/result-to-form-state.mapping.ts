import type { Result } from "@/shared/core/result/result-base";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { FormState } from "@/shared/forms/types/form-state.type";
import { buildDisplayFieldValues } from "@/shared/forms/utils/display-values.util";

/**
 * Map a Result into a FormState for UI consumption.
 *
 * One-way: Result<TData, DenseFieldErrorMap> -> FormState<TFieldNames, TData>
 *
 * @typeParam TFieldNames - Allowed field-name union for the form.
 * @typeParam TData - Payload on the success branch.
 * @param result - Result containing success data or dense field errors.
 * @param params - Mapping options.
 * @param params.fields - Readonly list of included field names.
 * @param params.raw - Raw input values keyed by field.
 * @param params.failureMessage - Failure message (default: validation failed).
 * @param params.redactFields - Fields to redact in values (default: ["password"]).
 * @param params.successMessage - Success message (default: generic success).
 * @returns FormState<TFieldNames, TData> describing success or failure.
 */
export function mapResultToFormState<TFieldNames extends string, TData>(
  result: Result<TData, DenseFieldErrorMap<TFieldNames>>,
  params: {
    successMessage?: string;
    failureMessage?: string;
    raw: Record<string, unknown>;
    fields: readonly TFieldNames[];
    redactFields?: readonly TFieldNames[];
  },
): FormState<TFieldNames, TData> {
  const {
    successMessage = FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw,
    fields,
    // Default redaction protects common sensitive fields.
    redactFields = ["password" as TFieldNames],
  } = params;

  // Fast-path: success payload for UI.
  if (result.success) {
    return {
      data: result.data,
      message: successMessage,
      success: true,
    };
  }

  return {
    errors: result.error,
    message: failureMessage,
    success: false,
    values: buildDisplayFieldValues(raw, fields, redactFields),
  };
}
