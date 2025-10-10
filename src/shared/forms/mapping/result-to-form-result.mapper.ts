import type { Result } from "@/shared/core/result/result";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import { selectDisplayableStringFieldValues } from "@/shared/forms/mapping/display-values.selector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type {
  FormError,
  FormResult,
  FormSuccess,
} from "@/shared/forms/types/form-result.type";

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
 * Maps a `Result` of a domain operation to a UI-facing `FormResult`.
 *
 * @param result - The discriminated `Result` containing either success data or validation errors.
 * @param params - Adapter options for messages and value echoing/redaction.
 * @returns A `FormResult` containing either `{ ok: true, value }` on success or `{ ok: false, error }` on failure.
 * @remarks
 * - Success path:
 *   - Wraps `result.value` as `FormSuccess<TData>` and applies `successMessage` (default: a generic success message).
 * - Failure path:
 *   - Converts `result.error` (fieldErrors/message) to a UI validation error.
 *   - Always computes a redacted `values` echo using `fields` and `redactFields` (default redacts "password").
 *   - If `result.error.message` is falsy, uses `failureMessage`.
 * - Use this when you already have a `Result<TData, FormValidationResult<TFieldNames>>`
 *   (e.g., from schema validation or a service boundary) and want a single adapter.
 * - For manual construction of only the failure case with finer control over redaction/value echo, use {@link toFormValidationErr}.
 */
export function mapResultToFormResult<TFieldNames extends string, TData>(
  result: Result<TData, FormValidationResult<TFieldNames>>,
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
    const value: FormSuccess<TData> = {
      data: result.value,
      message: successMessage,
    };
    return { ok: true, value };
  }

  // Normalize message fallback here so callers don't need to.
  const message = result.error.message || failureMessage;

  const error: FormError<TFieldNames> = {
    fieldErrors: result.error.fieldErrors,
    kind: "validation",
    message,
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
 * @remarks
 * - Equivalent to the success branch of {@link mapResultToFormResult}, but when you already have `data`.
 * - Does not attach any echoed `values`; those are only meaningful on validation failures.
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
 * @typeParam TFieldNames - The union of valid field names for the form.
 * @typeParam TData - The data type the form would return on success (unused here; this function always returns an error).
 *
 * Notes:
 * - Purpose: produce a UI‑ready validation error with optional redacted echo of submitted values.
 * - Redaction: by default, redacts "password" (override via `redactFields`).
 * - Values echo: included only when `fields` is non‑empty; omit `fields` to suppress echoing values.
 * - Success path: this function never returns success; use {@link mapResultToFormResult} when you have a `Result`.
 * @see {@link mapResultToFormResult} for mapping a Result (success or failure) into a FormResult.
 */
export function toFormValidationErr<TFieldNames extends string, TData>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldNames>;
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

  // Ensure parity with mapResultToFormResult failure branch:
  // - compute message once
  // - include values only when fields provided (kept behavior)
  const message = failureMessage;

  const error: FormError<TFieldNames> = {
    fieldErrors,
    kind: "validation",
    message,
    values:
      fields.length > 0
        ? selectDisplayableStringFieldValues(raw, fields, redactFields)
        : undefined,
  };
  return { error, ok: false };
}
