// File: src/shared/forms/mapping/result-to-form-result.mapper.ts

import type { Result } from "@/shared/core/result/result";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import { selectDisplayableStringFieldValues } from "@/shared/forms/mapping/display-values.selector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import {
  FormErr,
  type FormError,
  FormOk,
  type FormResult,
  type FormSuccess,
  type FormValidationError,
} from "@/shared/forms/types/form-result.types";

/**
 * Maps a domain `Result` to a UI-facing `FormResult` by delegating to the canonical shapers.
 *
 * @typeParam TFieldNames - Union of valid form field names.
 * @typeParam TData - The success payload type.
 * @param result - Discriminated `Result` with either success data or validation errors.
 * @param params - Adapter options for messages and value echoing/redaction.
 * @returns
 * - `{ ok: true, value }` on success via {@link toFormOk}.
 * - `{ ok: false, error }` on failure via {@link toFormValidationErr}.
 *
 * Remarks:
 * - Success:
 *   - Delegates to {@link toFormOk} with `successMessage` (defaults to a generic success message).
 * - Failure:
 *   - Delegates to {@link toFormValidationErr} and always computes a redacted `values` echo using `fields`
 *     and `redactFields` (defaults to `["password"]`).
 *   - Uses `result.error.message` if present; otherwise falls back to `failureMessage`.
 * - Use this when you already have `Result<TData, FormValidationResult<TFieldNames>>` (e.g., schema/service output)
 *   and want a single adapter to the UI `FormResult`.
 */
export function mapResultToFormResult<TFieldNames extends string, TData>(
  result: Result<TData, FormValidationError<TFieldNames>>,
  params: {
    fields: readonly TFieldNames[];
    raw: Record<string, unknown>;
    failureMessage?: string;
    redactFields?: readonly TFieldNames[];
    successMessage?: string;
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
    return toFormOk<TFieldNames, TData>(result.value, { successMessage });
  }

  return toFormValidationErr<TFieldNames, TData>({
    failureMessage: result.error.message || failureMessage,
    fieldErrors: result.error.fieldErrors,
    fields,
    raw,
    redactFields,
  });
}

/**
 * Create a UI-facing success `FormResult` from data.
 *
 * @typeParam TFieldNames - Union of valid form field names (not used on success; kept for consistency).
 * @typeParam TData - The success payload type.
 *
 * @param data - The successful payload.
 * @param opts - Optional success message override.
 * @returns `{ ok: true, value: { data, message } }`.
 *
 * Notes:
 * - This mirrors the success branch of {@link mapResultToFormResult}.
 * - No `values` echo is attached on success.
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
  return FormOk(value);
}

/**
 * Build a UI-facing validation error `FormResult` with optional redacted echo of submitted values.
 *
 * @typeParam TFieldNames - Union of valid form field names.
 * @typeParam TData - The success payload type (unused here; this always returns an error).
 *
 * @param params - Configuration for error shaping.
 * @param params.fieldErrors - Dense field error map for the form fields.
 * @param params.failureMessage - Optional override for the failure message (defaults to a generic validation failure).
 * @param params.raw - Raw submitted values used to compute the redacted `values` echo (defaults to `{}`).
 * @param params.fields - Ordered list of fields to echo (omit or pass empty to suppress `values` entirely).
 * @param params.redactFields - Fields to redact in the echoed `values` (defaults to `["password"]`).
 * @returns `{ ok: false, error: { kind: "validation", fieldErrors, message, values? } }`.
 *
 * Notes:
 * - Used directly when manually constructing a validation failure.
 * - The failure path of {@link mapResultToFormResult} delegates to this function for consistency.
 */
export function toFormValidationErr<TFieldNames extends string, TData>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldNames, readonly string[]>;
  readonly failureMessage?: string;
  readonly fields?: readonly TFieldNames[];
  readonly raw?: Record<string, unknown>;
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
  return FormErr(error);
}
