import type { Result } from "@/shared/core/result/result-base";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/messages";
import type {
  DenseFormErrors,
  FormErrors,
  FormState,
} from "@/shared/forms/types";

export function buildValues<TFieldNames extends string>(
  raw: Record<string, unknown>,
  fields: readonly TFieldNames[],
  redactFields: readonly TFieldNames[],
): Partial<Record<TFieldNames, string>> {
  const values: Partial<Record<TFieldNames, string>> = {};
  for (const key of fields) {
    if (redactFields.includes(key)) {
      continue;
    }
    const v = raw[key as string];
    if (typeof v === "string") {
      values[key] = v;
    }
  }
  return values;
}

/**
 * Adapter: Result -> FormState
 *
 * Provide messages and repopulated values (with redaction) at the boundary.
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
    redactFields = ["password" as TFieldNames],
  } = params;

  if (r.success) {
    return {
      data: r.data,
      message: successMessage,
      success: true,
    };
  }

  // Convert dense to sparse form errors for UI friendliness
  const sparse: FormErrors<TFieldNames> = {};
  for (const key of fields) {
    const arr = r.error[key];
    if (arr && arr.length > 0) {
      sparse[key] = arr as unknown as readonly [string, ...string[]];
    }
  }

  return {
    errors: sparse,
    message: failureMessage,
    success: false,
    values: buildValues(raw, fields, redactFields),
  };
}
