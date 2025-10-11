import type { ErrorLike } from "@/shared/core/result/error";
import { toDenseFieldErrorMapFromSparse } from "@/shared/forms/errors/dense-error-map";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type {
  FormResult,
  FormValidationError,
} from "@/shared/forms/types/form-result.types";
import { formErrStrings } from "@/shared/forms/types/form-result.types";

/**
 * Convert an ErrorLike payload to a FormValidationError with dense empty arrays by default.
 */
export function appErrorToFormValidationError<TField extends string>(params: {
  readonly fields: readonly TField[];
  readonly error: ErrorLike | string;
  readonly fieldErrorsSparse?: Partial<Record<TField, readonly string[]>>;
}): FormValidationError<TField, string, string> {
  const dense: DenseFieldErrorMap<TField, string> =
    toDenseFieldErrorMapFromSparse<TField, string>(
      params.fieldErrorsSparse as Partial<Record<TField, string>>,
      params.fields,
    );
  const message =
    typeof params.error === "string" ? params.error : params.error.message;

  return {
    fieldErrors: dense,
    kind: "validation",
    message,
  };
}

/**
 * Convert an ErrorLike payload to a FormResult error with dense field errors.
 */
export function appErrorToFormResult<TField extends string, TData>(params: {
  readonly fields: readonly TField[];
  readonly error: ErrorLike | string;
  readonly fieldErrorsSparse?: Partial<Record<TField, readonly string[]>>;
}): FormResult<TField, TData> {
  const dense: DenseFieldErrorMap<TField, string> =
    toDenseFieldErrorMapFromSparse<TField, string>(
      params.fieldErrorsSparse as Partial<Record<TField, readonly string[]>>,
      params.fields,
    );
  const message =
    typeof params.error === "string" ? params.error : params.error.message;

  return formErrStrings<TField, TData>({
    fieldErrors: dense,
    message,
  });
}
