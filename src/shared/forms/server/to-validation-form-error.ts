import type { z } from "zod";
import { toDenseFieldErrorMapFromZod } from "@/shared/forms/adapters/zod-error.adapter";
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
      ? toDenseFieldErrorMapFromZod<Tfieldnames>(error as z.ZodError, fields)
      : makeEmptyDenseFieldErrorMap<Tfieldnames, string>(fields);

  return makeFormError<Tfieldnames>({
    fieldErrors,
    message: failureMessage,
  });
}
