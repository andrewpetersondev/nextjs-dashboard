import type { Result } from "@/shared/core/result/result";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import { selectDisplayableStringFieldValues } from "@/shared/forms/mapping/display-values.selector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type {
  FormError,
  FormResult,
  FormSuccess,
} from "@/shared/forms/types/form-state.type";

/** Local ErrorLike wrapper used by validate-form failure path. */
export interface ValidationFieldErrorsError<TFieldNames extends string> {
  readonly message: string;
  readonly fieldErrors: DenseFieldErrorMap<TFieldNames>;
}

/**
 * Map a Result<TData, ValidationFieldErrorsError> to a canonical FormResult (ok/err union).
 * @template TFieldNames Field name union.
 * @template TData Success data type.
 */
export function mapResultToFormResult<TFieldNames extends string, TData>(
  result: Result<TData, ValidationFieldErrorsError<TFieldNames>>,
  params: {
    successMessage?: string;
    failureMessage?: string;
    raw: Record<string, unknown>;
    fields: readonly TFieldNames[];
    redactFields?: readonly TFieldNames[];
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

  const error: FormError<TFieldNames> = {
    fieldErrors: result.error.fieldErrors,
    kind: "validation",
    message: result.error.message || failureMessage,
    values: selectDisplayableStringFieldValues(raw, fields, redactFields),
  };
  return { error, ok: false };
}

/**
 * Build a successful FormResult from already-validated data.
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
 * Build a failed FormResult from a dense error map (validation kind).
 */
export function toFormValidationErr<TFieldNames extends string, TData>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldNames>;
  readonly failureMessage?: string;
  readonly raw?: Record<string, unknown>;
  readonly fields?: readonly TFieldNames[];
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
    values: fields.length
      ? selectDisplayableStringFieldValues(raw, fields, redactFields)
      : undefined,
  };
  return { error, ok: false };
}
