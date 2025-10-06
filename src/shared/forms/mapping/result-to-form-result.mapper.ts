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
