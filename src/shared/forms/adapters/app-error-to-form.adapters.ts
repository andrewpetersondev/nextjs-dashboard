import type { AppError } from "@/shared/core/result/app-error";
import {
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/errors/dense-error-map";
import { selectDisplayableStringFieldValues } from "@/shared/forms/mapping/display-values.selector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import {
  FormErr,
  type FormResult,
} from "@/shared/forms/types/form-result.types";

const EMAIL_REGEX = /email/i;

/**
 * Adapter: AppError -> FormResult (always validation-shaped, dense map).
 *
 * - If code is CONFLICT and details indicate the email column/field, sets only `email` errors.
 * - Otherwise produces dense empty arrays and a generic message.
 * - Echoes redacted values from raw (defaults to password/confirmPassword redaction).
 *
 * TODO: the parameter type could be standardized
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <61 of 50>
export function appErrorToFormResult<TField extends string, TData>(params: {
  readonly fields: readonly TField[];
  readonly raw: Readonly<Record<string, unknown>>;
  readonly error: AppError;
  readonly redactFields?: readonly TField[];
  readonly conflictEmailField?: TField; // default: inferred "email" if present
  readonly conflictMessage?: string;
  readonly defaultMessage?: string;
}): FormResult<TField, TData> {
  const {
    fields,
    raw,
    error,
    redactFields = [] as unknown as readonly TField[],
    conflictEmailField,
    conflictMessage = "Email already in use",
    defaultMessage = "Request failed. Please try again.",
  } = params;

  // Compute a safe default for redactFields based on allowed fields (avoid widening to string[])
  const inferredRedact: readonly TField[] = (
    ["password", "confirmPassword"] as const
  )
    .filter((k) => (fields as readonly string[]).includes(k))
    .map((k) => k as TField);

  const effectiveRedact: readonly TField[] =
    redactFields.length > 0 ? redactFields : inferredRedact;

  const emailField =
    conflictEmailField ??
    ((fields.includes("email" as TField) ? ("email" as TField) : undefined) as
      | TField
      | undefined);

  const isConflict = error.code === "CONFLICT";
  const details = (error.details ?? {}) as {
    readonly column?: string;
    readonly constraint?: string;
    readonly fields?: readonly string[];
  };

  const shouldTargetEmail =
    isConflict &&
    emailField !== undefined &&
    (details.column === "email" ||
      details.fields?.includes?.("email") === true ||
      EMAIL_REGEX.test(details.constraint ?? ""));

  const sparse: Partial<Record<TField, readonly string[]>> = {};
  if (shouldTargetEmail && emailField) {
    sparse[emailField] = Object.freeze([conflictMessage]);
  }

  const limitedSparse = selectSparseFieldErrorsForAllowedFields<TField, string>(
    sparse,
    fields,
  );
  const dense: DenseFieldErrorMap<TField, string> =
    toDenseFieldErrorMapFromSparse<TField, string>(limitedSparse, fields);

  const values = selectDisplayableStringFieldValues(
    raw,
    fields,
    effectiveRedact,
  );

  return FormErr<TField, TData, string, string>({
    fieldErrors: dense,
    message: shouldTargetEmail
      ? conflictMessage
      : error.message || defaultMessage,
    values,
  });
}
