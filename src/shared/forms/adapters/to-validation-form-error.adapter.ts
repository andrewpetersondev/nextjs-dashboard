import { fromZodError } from "@/shared/forms/adapters/zod-error.adapter";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/core/guards/zod.guard";
import {
  EMPTY_FORM_ERRORS,
  type ValidationErrors,
} from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Maps an unknown error to a canonical ValidationErrors shape.
 */
export function mapToValidationErrors<T extends string>(
  error: unknown,
  fields: readonly T[],
): ValidationErrors<T, string> {
  if (isZodErrorInstance(error) || isZodErrorLikeShape(error)) {
    return fromZodError<T>(error, fields);
  }

  return {
    fieldErrors: makeEmptyDenseFieldErrorMap<T, string>(fields),
    formErrors: EMPTY_FORM_ERRORS,
  };
}

/**
 * Internal helper to log and wrap validation errors.
 */
export function toValidationFormErrorAdapter<Tfieldnames extends string>(
  error: unknown,
  fields: readonly Tfieldnames[],
  loggerContext: string,
  failureMessage: string,
): FormResult<never> {
  const isZodShape = isZodErrorLikeShape(error);

  logger.error(failureMessage, {
    context: loggerContext,
    issues: isZodShape ? error.issues.length : undefined,
    name: isZodShape ? error.name : "UnknownValidationError",
  });

  const { fieldErrors, formErrors } = mapToValidationErrors<Tfieldnames>(
    error,
    fields,
  );

  return makeFormError<Tfieldnames>({
    fieldErrors,
    formErrors,
    message: failureMessage,
  });
}
