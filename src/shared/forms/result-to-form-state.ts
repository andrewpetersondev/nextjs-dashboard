/**
 * @file Adapter: convert a domain Result with dense form errors into a UI FormState (dense).
 */

import type { Result } from "@/shared/core/result/result-base";
import { buildDisplayValues } from "@/shared/forms/field-values";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/form-messages";
import type { DenseErrorMap, FormState } from "@/shared/forms/form-types";

export function resultToFormState<TFieldNames extends string, TData>(
  r: Result<TData, DenseErrorMap<TFieldNames>>,
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
    failureMessage = FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    raw,
    fields,
    // Default redaction protects common sensitive fields.
    redactFields = ["password" as TFieldNames],
  } = params;

  // Fast-path: success payload for UI.
  if (r.success) {
    return {
      data: r.data,
      message: successMessage,
      success: true,
    };
  }

  return {
    errors: r.error,
    message: failureMessage,
    success: false,
    values: buildDisplayValues(raw, fields, redactFields),
  };
}
