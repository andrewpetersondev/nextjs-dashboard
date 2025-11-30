// src/shared/errors/forms/base-error.mappers.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import { getFieldErrors } from "@/shared/errors/core/guards";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";

export function mapBaseErrorToFormPayload<T extends string>(
  error: BaseError,
): {
  fieldErrors: DenseFieldErrorMap<T, string>;
  message: string;
} {
  // Extract fieldErrors from metadata using type guard
  const fieldErrors = (getFieldErrors(error) ??
    {}) as unknown as DenseFieldErrorMap<T, string>;

  const message = error.message;

  return {
    fieldErrors,
    message,
  };
}
