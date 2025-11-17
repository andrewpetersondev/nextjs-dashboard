import type { AppError } from "@/shared/errors/app-error/app-error";
import type { BaseError } from "@/shared/errors/base-error";

export function appErrorFromBaseError(error: BaseError): AppError {
  return {
    __appError: "AppError",
    code: error.code,
    details: {
      __brand: "AppErrorDetails",
      extra: error.context,
      fieldErrors: error.fieldErrors,
      formErrors: error.formErrors,
    },
    kind: error.category,
    message: error.message,
    severity: error.severity,
    stack: error.stack,
  };
}
