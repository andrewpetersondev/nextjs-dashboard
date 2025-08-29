import "server-only";

import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/messages";
import type {
  DenseFormErrors,
  FieldErrors,
  FormErrors,
  FormState,
} from "@/shared/forms/types";
import type { Result } from "@/shared/result/result-base";

// --- Adapters (presentation concerns live here) ---

function buildValues<TFieldNames extends string>(
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

/**
 * Adapter: Result -> ActionResult
 *
 * Keeps existing action contract and maps errors into FieldErrors.
 */
export function toActionResult<TFieldNames extends string, TData>(
  r: Result<TData, DenseFormErrors<TFieldNames>>,
  params?: { successMessage?: string; failureMessage?: string },
):
  | { success: true; message: string; data: TData }
  | {
      success: false;
      message: string;
      errors: FieldErrors;
    } {
  const successMessage =
    params?.successMessage ?? FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE;
  const failureMessage =
    params?.failureMessage ?? FORM_ERROR_MESSAGES.FAILED_VALIDATION;

  if (r.success) {
    return {
      data: r.data,
      message: successMessage,
      success: true,
    };
  }

  // Coerce dense keyed by field union into the non-generic FieldErrors
  return {
    errors: r.error as unknown as FieldErrors,
    message: failureMessage,
    success: false,
  };
}
