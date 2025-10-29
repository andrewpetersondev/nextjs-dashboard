import "server-only";
import type { z } from "zod";
import {
  resolveValidateOptions,
  type ValidateOptions,
} from "@/shared/forms/application/options/validate-options";
import { resolveRawFieldPayload } from "@/shared/forms/application/utils/field-payload-resolver";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/factories/error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapZodErrorToDenseFieldErrors } from "@/shared/forms/infrastructure/zod/error-mapper";
import { resolveCanonicalFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/field-resolver";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/infrastructure/zod/guards";
import { logger } from "@/shared/logging/logger.shared";

/**
 * Transforms an error into a FormResult with validation errors.
 * Logs failure, converts error to dense field errors, and returns form error.
 *
 * @typeParam TFieldNames - String literal union of field names.
 * @param error - The validation error to transform.
 * @param fields - Array of field names for error mapping.
 * @param loggerContext - Context string for logging.
 * @param failureMessage - Message to display for the form error.
 * @returns FormResult with validation errors.
 */
function createValidationFormError<Tfieldnames extends string>(
  error: unknown,
  fields: readonly Tfieldnames[],
  loggerContext: string,
  failureMessage: string,
): FormResult<never> {
  // Log validation failure
  const name = isZodErrorLikeShape(error) ? error.name : undefined;
  const issues =
    isZodErrorLikeShape(error) && Array.isArray(error.issues)
      ? error.issues.length
      : undefined;
  logger.error(failureMessage, {
    context: loggerContext,
    issues,
    message: failureMessage,
    name,
  });

  // Transform error to dense field errors
  const fieldErrors =
    isZodErrorInstance(error) || isZodErrorLikeShape(error)
      ? mapZodErrorToDenseFieldErrors<Tfieldnames>(error as z.ZodError, fields)
      : createEmptyDenseFieldErrorMap<Tfieldnames, string>(fields);

  return formError<Tfieldnames>({
    fieldErrors,
    message: failureMessage,
  });
}

/**
 * Validates form data against a Zod schema.
 *
 * @typeParam TIn - Type representing expected form data structure.
 * @typeParam TFieldNames - String keys of fields within TIn to validate.
 * @param formData - FormData to validate.
 * @param schema - Zod schema for validation.
 * @param allowedFields - Optional list of specific fields to validate.
 * @param options - Additional validation options.
 * @returns Promise resolving to FormResult with validated data or errors.
 */
export async function validateForm<Tin, Tfieldnames extends keyof Tin & string>(
  formData: FormData,
  schema: z.ZodType<Tin>,
  allowedFields?: readonly Tfieldnames[],
  options: ValidateOptions<Tin, Tfieldnames> = {},
): Promise<FormResult<Tin>> {
  const {
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext,
    failureMessage,
    successMessage,
  } = resolveValidateOptions(options);

  const fields = resolveCanonicalFieldNamesFromSchema<Tin, Tfieldnames>(
    schema,
    allowedFields,
    explicitFields,
  );

  const raw = resolveRawFieldPayload(formData, fields, explicitRaw);

  let parsed: Awaited<ReturnType<typeof schema.safeParseAsync>>;
  try {
    parsed = await schema.safeParseAsync(raw);
  } catch (e: unknown) {
    // Unexpected errors during validation (e.g., async refinements throwing)
    return createValidationFormError<Tfieldnames>(
      e,
      fields,
      loggerContext,
      failureMessage,
    );
  }

  // Zod validation failed
  if (!parsed.success) {
    return createValidationFormError<Tfieldnames>(
      parsed.error,
      fields,
      loggerContext,
      failureMessage,
    );
  }

  return formOk<Tin>(parsed.data, successMessage);
}
