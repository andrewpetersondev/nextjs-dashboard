import type { AppError } from "@/shared/core/result/app-error/app-error";
import { type FormResult, formError } from "@/shared/forms/core/types";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types/dense.types";
import { selectDisplayableStringFieldValues } from "@/shared/forms/state/mappers/display-values.mapper";
import {
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/validation/dense-error-map";

const EMAIL_REGEX = /email/i;

type ConflictDetails = {
  readonly column?: string;
  readonly constraint?: string;
  readonly fields?: readonly string[];
};

// Strengthen typing of inferRedact: remove unsafe casts, keep literals, and narrow via a type predicate.
function inferRedact<TField extends string>(
  fields: readonly TField[],
  explicit?: readonly TField[],
): readonly TField[] {
  if (explicit && explicit.length > 0) {
    return explicit;
  }
  const candidates = ["password", "confirmPassword"] as const;
  const isField = (k: string): k is TField =>
    (fields as readonly string[]).includes(k);

  const inferred = candidates.filter((k) => isField(k));
  return inferred as readonly TField[];
}

function inferEmailField<TField extends string>(
  fields: readonly TField[],
  override?: TField,
): TField | undefined {
  if (override) {
    return override;
  }
  return fields.includes("email" as TField) ? ("email" as TField) : undefined;
}

function isEmailConflict(
  error: AppError,
  emailField: string | undefined,
): { targeted: boolean; details: ConflictDetails } {
  const isConflict = error.code === "CONFLICT";
  const details = (error.details ?? {}) as ConflictDetails;
  const targeted =
    isConflict &&
    emailField !== undefined &&
    (details.column === "email" ||
      details.fields?.includes?.("email") === true ||
      EMAIL_REGEX.test(details.constraint ?? ""));
  return { details, targeted };
}

// POTENTIAL TO BE USED FOR ALL APP ERRORS ACROSS ALL FEATURES IN SERVICE LAYER
export type AppErrorToFormParams<TField extends string> = {
  readonly fields: readonly TField[];
  readonly raw: Readonly<Record<string, unknown>>;
  readonly error: AppError;
  readonly redactFields?: readonly TField[];
  readonly conflictEmailField?: TField;
  readonly conflictMessage?: string;
  readonly defaultMessage?: string;
};

/**
 * Adapter: AppError -> FormResult (always validation-shaped, dense map).
 *
 * - If code is CONFLICT and details indicate the email column/field, sets only `email` errors.
 * - Otherwise produces dense empty arrays and a generic message.
 * - Echoes redacted values from raw (defaults to password/confirmPassword redaction).
 */
export function appErrorToFormResult<TField extends string, TData>(
  params: AppErrorToFormParams<TField>,
): FormResult<TField, TData> {
  const {
    fields,
    raw,
    error,
    redactFields,
    conflictEmailField,
    conflictMessage = "Email already in use",
    defaultMessage = "Request failed. Please try again.",
  } = params;

  const effectiveRedact = inferRedact(fields, redactFields);
  const emailField = inferEmailField(fields, conflictEmailField);
  const { targeted } = isEmailConflict(error, emailField as string | undefined);

  // Fix typing for sparse: ensure key is TField (not string) and value is readonly string[]
  const sparse: Partial<Record<TField, readonly string[]>> =
    targeted && emailField
      ? ({ [emailField]: Object.freeze([conflictMessage]) } as Partial<
          Record<TField, readonly string[]>
        >)
      : {};

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

  return formError<TField, TData, string, string>({
    fieldErrors: dense,
    message: targeted ? conflictMessage : error.message || defaultMessage,
    values,
  });
}
