// src/shared/errors/forms/base-error.mappers.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";

export function mapBaseErrorToFormPayload<T extends string>(
  error: BaseError,
): {
  fieldErrors: DenseFieldErrorMap<T, string>;
  message: string;
} {
  // Break dependency on shared/forms application layer.
  // We directly access fieldErrors from the error object.
  const fieldErrors = (error.fieldErrors ??
    {}) as unknown as DenseFieldErrorMap<T, string>;

  const message = error.message;

  return {
    fieldErrors,
    message,
  };
}
