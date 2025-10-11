import { Err } from "@/shared/core/result/result";
import { toDenseFieldErrorMapFromSparse } from "@/shared/forms/errors/dense-error-map";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type {
  FormResult,
  FormValidationError,
} from "@/shared/forms/types/form-result.type";

// Convert AppError-like payloads to a FormValidationError with dense empty arrays by default.
export function appErrorToFormValidationError<TField extends string>(params: {
  readonly fields: readonly TField[];
  readonly message: string;
  readonly fieldErrorsSparse?: Partial<Record<TField, readonly string[]>>;
}): FormValidationError<TField, string, string> {
  const dense: DenseFieldErrorMap<TField, readonly string[]> =
    toDenseFieldErrorMapFromSparse<TField, string>(
      params.fieldErrorsSparse as Partial<
        Record<TField, readonly [string, ...string[]]>
      >,
      params.fields,
    );
  return {
    fieldErrors: dense,
    kind: "validation",
    message: params.message,
    // values left undefined at this boundary
  };
}

export function appErrorToFormResult<TField extends string, TData>(params: {
  readonly fields: readonly TField[];
  readonly message: string;
  readonly fieldErrorsSparse?: Partial<Record<TField, readonly string[]>>;
}): FormResult<TField, TData> {
  const err = appErrorToFormValidationError<TField>({
    fieldErrorsSparse: params.fieldErrorsSparse,
    fields: params.fields,
    message: params.message,
  });
  return Err(err);
}
