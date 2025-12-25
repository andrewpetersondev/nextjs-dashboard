import type { z } from "zod";
import { fromZodError } from "@/shared/forms/adapters/zod-error.adapter";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/core/guards/zod.guard";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Internal helper to log and wrap validation errors.
 */
export function toValidationFormErrorAdapter<Tfieldnames extends string>(
  error: unknown,
  fields: readonly Tfieldnames[],
  loggerContext: string,
  failureMessage: string,
): FormResult<never> {
  const isZod = isZodErrorInstance(error) || isZodErrorLikeShape(error);

  logger.error(failureMessage, {
    context: loggerContext,
    issues: isZodErrorLikeShape(error) ? error.issues?.length : undefined,
    name: isZodErrorLikeShape(error) ? error.name : "UnknownValidationError",
  });

  const { fieldErrors, formErrors } = isZod
    ? fromZodError<Tfieldnames>(error as z.ZodError, fields)
    : {
        fieldErrors: makeEmptyDenseFieldErrorMap<Tfieldnames, string>(fields),
        formErrors: Object.freeze([]) as readonly string[],
      };

  return makeFormError<Tfieldnames>({
    fieldErrors,
    formErrors,
    message: failureMessage,
  });
}
