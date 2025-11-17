// src/server/forms/validate-form.ts
import "server-only";
import type { z } from "zod";
import { resolveRawFieldPayload } from "@/shared/forms/application/field-payload-resolver";
import {
  resolveValidateOptions,
  type ValidateOptions,
} from "@/shared/forms/application/validate-options";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/error-map.factory";
import { formError, formOk } from "@/shared/forms/domain/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { mapZodErrorToDenseFieldErrors } from "@/shared/forms/infrastructure/zod-error.mapper";
import { resolveCanonicalFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod-field.resolver";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/infrastructure/zod-guards";
import { logger } from "@/shared/logging/logger.shared";

/**
 * Transform an error into a `FormResult` containing validation errors.
 *
 * @typeParam Tfieldnames - String literal union of field names.
 * @param error - The validation error to transform.
 * @param fields - Array of canonical field names used for error mapping.
 * @param loggerContext - Context identifier used when logging the error.
 * @param failureMessage - Message to include in the returned form error.
 * @returns A `FormResult` representing a failed validation with field errors.
 *
 * @remarks
 * Logs a structured error, converts Zod error shapes to a dense field error map,
 * and returns a `formError` populated with the message and field errors.
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
 * Validate `FormData` against a Zod schema and return a `FormResult`.
 *
 * @typeParam Tin - The expected shape of the validated data.
 * @typeParam Tfieldnames - Keys of fields within `Tin` that are validated.
 * @param formData - The incoming `FormData` to validate.
 * @param schema - A Zod schema describing the expected data shape.
 * @param allowedFields - Optional subset of field keys to validate (defaults to schema fields).
 * @param options - Validation options resolved via `resolveValidateOptions`.
 * @returns A promise resolving to `FormResult<Tin>` which is `formOk` on success or `formError` on failure.
 *
 * @remarks
 * This function:
 * - Resolves validation options and canonical field names.
 * - Extracts raw payload from `FormData`.
 * - Calls `schema.safeParseAsync` and maps Zod errors to form field errors when validation fails.
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
