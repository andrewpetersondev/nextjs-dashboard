/**
 * @file Adapter utilities for converting domain-level Result objects into UI-facing FormState.
 * Ensures friendly messages, sparse error shape, and safe value echoing with optional redaction.
 */
import type { Result } from "@/shared/core/result/result-base";
import { buildDisplayValues } from "@/shared/forms/field-values";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/form-messages";
import type {
  DenseFormErrors,
  FormErrors,
  FormState,
} from "@/shared/forms/form-types";

/**
 * Converts a domain Result into a UI FormState with messages and (optionally redacted) values.
 *
 * Responsibilities:
 * - On success: returns data with a success message.
 * - On failure: converts dense errors to a sparse map and echoes back non-sensitive string values.
 *
 * Safety:
 * - Values are produced via `buildDisplayValues` to exclude non-strings and redact sensitive fields (defaults to "password").
 *
 * @typeParam TFieldNames - Union of field name literals.
 * @typeParam TData - Validated data type on success.
 *
 * @param r - Domain result with success/data or dense field errors.
 * @param params - Adapter configuration.
 * @param params.successMessage - Message on success (defaults to a generic success message).
 * @param params.failureMessage - Message on failure (defaults to validation failed).
 * @param params.raw - Raw payload used to repopulate values on failure.
 * @param params.fields - Ordered list of form fields to include in errors/values.
 * @param params.redactFields - Field names to omit from echoed values (defaults to ["password"]).
 * @returns A FormState suitable for UI consumption.
 */
export function toFormState<TFieldNames extends string, TData>(
  r: Result<TData, DenseFormErrors<TFieldNames>>,
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

  // Convert dense error arrays to a sparse map keyed only by fields that have errors.
  const sparse: FormErrors<TFieldNames> = {};
  for (const key of fields) {
    const arr = r.error[key];
    if (arr && arr.length > 0) {
      // Cast to non-empty readonly tuple for UI expectations.
      sparse[key] = arr as unknown as readonly [string, ...string[]];
    }
  }

  // On failure, return sparse errors and echo safe string values for repopulating the form.
  return {
    errors: sparse,
    message: failureMessage,
    success: false,
    values: buildDisplayValues(raw, fields, redactFields),
  };
}
