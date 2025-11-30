// src/shared/errors/forms/mapper.ts
import type { AppError } from "@/shared/errors/app-error";
import { getFieldErrors } from "@/shared/errors/guards";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";

export function mapAppErrorToFormPayload<T extends string>(
  error: AppError,
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
