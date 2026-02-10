import "server-only";
import { fromZodError } from "@/shared/forms/adapters/zod-error.adapter";
import { EMPTY_FORM_ERRORS } from "@/shared/forms/core/constants";
import type {
  SparseFieldValueMap,
  ValidationErrors,
} from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/mappers/make-empty-dense-field-error.map";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/validation/zod/zod.guard";

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
  loggerContext: string,
  {
    fields,
    failureMessage,
    formData = Object.freeze({}),
  }: {
    fields: readonly Tfieldnames[];
    failureMessage: string;
    formData?: SparseFieldValueMap<Tfieldnames, string>;
  },
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
    formData,
    formErrors,
    key: "validation",
    message: failureMessage,
  });
}
