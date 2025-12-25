import type { z } from "zod";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/factories/field-error-map.factory";
import { makeFormError } from "@/shared/forms/factories/form-result.factory";
import type { FormResult } from "@/shared/forms/types/form-result.dto";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/zod/zod.guard";
import { fromZodError } from "@/shared/forms/zod/zod-error.adapter";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Internal helper to log and wrap validation errors.
 */
export function toValidationFormError<Tfieldnames extends string>(
  error: unknown,
  fields: readonly Tfieldnames[],
  loggerContext: string,
  failureMessage: string,
): FormResult<never> {
  logger.error(failureMessage, {
    context: loggerContext,
    issues: isZodErrorLikeShape(error) ? error.issues?.length : undefined,
    name: isZodErrorLikeShape(error) ? error.name : "UnknownValidationError",
  });

  const fieldErrors =
    isZodErrorInstance(error) || isZodErrorLikeShape(error)
      ? fromZodError<Tfieldnames>(error as z.ZodError, fields)
      : makeEmptyDenseFieldErrorMap<Tfieldnames, string>(fields);

  return makeFormError<Tfieldnames>({
    fieldErrors,
    message: failureMessage,
  });
}
