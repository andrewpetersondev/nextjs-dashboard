// File: 'src/shared/errors/base-error.mappers.ts'
// Summary: Form mapping without fallbacks. Message comes directly from the error.

import type { BaseError } from "@/shared/errors/base-error";
import { getFieldErrors } from "@/shared/forms/application/field-errors.extractor";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";

export function mapBaseErrorToFormPayload<T extends string>(
  error: BaseError,
): {
  fieldErrors: DenseFieldErrorMap<T, string>;
  message: string;
} {
  const fieldErrors =
    getFieldErrors<T>(error) ?? ({} as DenseFieldErrorMap<T, string>);

  const message = error.message;

  return {
    fieldErrors,
    message,
  };
}
