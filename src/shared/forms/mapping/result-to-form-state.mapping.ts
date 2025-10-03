import type { Result } from "@/shared/core/result/result";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/i18n/form-messages.const";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { LegacyFormState } from "@/shared/forms/types/form-state.type";
import { buildDisplayFieldValues } from "@/shared/forms/utils/display-values.util";

/**
 * Map a Result<TData, DenseFieldErrorMap> to a canonical FormState (ok union).
 * @template TFieldNames Field name union.
 * @template TData Success data type.
 */
export function mapResultToFormState<TFieldNames extends string, TData>(
  result: Result<TData, DenseFieldErrorMap<TFieldNames>>,
  params: {
    successMessage?: string;
    failureMessage?: string;
    raw: Record<string, unknown>;
    fields: readonly TFieldNames[];
    redactFields?: readonly TFieldNames[];
  },
): LegacyFormState<TFieldNames, TData> {
  const {
    successMessage = FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw,
    fields,
    redactFields = ["password" as TFieldNames],
  } = params;

  if (result.ok) {
    return {
      data: result.value,
      message: successMessage,
      ok: true,
    };
  }
  return {
    errors: result.error,
    message: failureMessage,
    ok: false,
    values: buildDisplayFieldValues(raw, fields, redactFields),
  };
}
