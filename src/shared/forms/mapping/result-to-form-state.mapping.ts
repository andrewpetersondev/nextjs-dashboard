import type { Result } from "@/shared/core/result/result-base";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { FormState } from "@/shared/forms/types/form-state.type";
import { buildDisplayFieldValues } from "@/shared/forms/utils/display-values.util";

/**
 * Map a Result into a UI-friendly FormState.
 *
 * Produces a success payload when r.success is true; otherwise returns errors and
 * the raw values with optional field redaction (defaults to ["password"]).
 *
 * @typeParam TFieldNames - Union of form field names (string literals).
 * @typeParam TData - Success payload type carried by the Result.
 * @param r - Result from a form operation with success or dense field errors.
 * @param params - Messages, raw input, field list, and optional redactFields.
 * @returns FormState with message, success flag, data or errors plus safe values.
 * @example
 * ```typescript
 * type Fields = "email" | "password";
 * const rOk: Result<number, DenseFieldErrorMap<Fields>> = { success: true, data: 123 };
 * const stateOk = mapResultToFormState<Fields, number>(rOk, {
 *   raw: { email: "a@x.com", password: "secret" },
 *   fields: ["email", "password"] as const,
 * });
 * // stateOk.success === true
 *
 * const rErr: Result<number, DenseFieldErrorMap<Fields>> = {
 *   success: false,
 *   error: { email: ["Invalid"], password: [] },
 * };
 * const stateErr = mapResultToFormState<Fields, number>(rErr, {
 *   raw: { email: "bad", password: "secret" },
 *   fields: ["email", "password"] as const,
 * });
 * // stateErr.success === false
 * ```
 */
export function mapResultToFormState<TFieldNames extends string, TData>(
  r: Result<TData, DenseFieldErrorMap<TFieldNames>>,
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
    values: buildDisplayFieldValues(raw, fields, redactFields),
  };
}
