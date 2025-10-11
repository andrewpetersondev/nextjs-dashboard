import { toDenseFieldErrorMapFromSparse } from "@/shared/forms/errors/dense-error-map";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type {
  FormResult,
  FormValidationError,
} from "@/shared/forms/types/form-result.types";
import { formErrStrings } from "@/shared/forms/types/form-result.types";

// Convert AppError-like payloads to a FormValidationError with dense empty arrays by default.
export function appErrorToFormValidationError<TField extends string>(params: {
  readonly fields: readonly TField[];
  readonly message: string;
  readonly fieldErrorsSparse?: Partial<Record<TField, readonly string[]>>;
}): FormValidationError<TField, string, string> {
  const dense: DenseFieldErrorMap<TField, string> =
    toDenseFieldErrorMapFromSparse<TField, string>(
      params.fieldErrorsSparse as Partial<Record<TField, readonly string[]>>,
      params.fields,
    );
  return {
    fieldErrors: dense,
    kind: "validation",
    message: params.message,
  };
}

export function appErrorToFormResult<TField extends string, TData>(params: {
  readonly fields: readonly TField[];
  readonly message: string;
  readonly fieldErrorsSparse?: Partial<Record<TField, readonly string[]>>;
}): FormResult<TField, TData> {
  const dense: DenseFieldErrorMap<TField, string> =
    toDenseFieldErrorMapFromSparse<TField, string>(
      params.fieldErrorsSparse as Partial<Record<TField, readonly string[]>>,
      params.fields,
    );
  return formErrStrings<TField, TData>({
    fieldErrors: dense,
    message: params.message,
  });
}
