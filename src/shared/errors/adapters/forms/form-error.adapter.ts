import type { AppError } from "@/shared/errors/core/app-error.class";
import { getFieldErrors } from "@/shared/errors/guards/form-error.guards";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";

export function mapAppErrorToFormPayload<T extends string>(
  error: AppError,
): {
  fieldErrors: DenseFieldErrorMap<T, string>;
  message: string;
} {
  const sparse = getFieldErrors(error);
  const fieldErrors: DenseFieldErrorMap<T, string> = (sparse ??
    {}) as DenseFieldErrorMap<T, string>;

  return {
    fieldErrors,
    message: error.message,
  };
}
