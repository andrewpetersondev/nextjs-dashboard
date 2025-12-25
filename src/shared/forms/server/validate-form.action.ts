import "server-only";

import type { z } from "zod";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/factories/field-error-map.factory";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/factories/form-result.factory";
import { resolveFormValidationOptions } from "@/shared/forms/factories/form-validation-options.factory";
import { resolveRawFieldPayload } from "@/shared/forms/infrastructure/form-data-extractor";
import type { FormResult } from "@/shared/forms/types/form-result.dto";
import type { FormValidationOptions } from "@/shared/forms/types/form-validation.dto";
import { resolveCanonicalFieldNames } from "@/shared/forms/zod/schema-inspector";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/zod/zod.guard";
import { fromZodError } from "@/shared/forms/zod/zod-error.adapter";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Internal helper to log and wrap validation errors.
 */
function toValidationFormError<Tfieldnames extends string>(
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

/**
 * Validates FormData against a Zod schema.
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
  options: FormValidationOptions<Tin, Tfieldnames> = {},
): Promise<FormResult<Tin>> {
  const {
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext,
    failureMessage,
    successMessage,
  } = resolveFormValidationOptions(options);

  const fields = resolveCanonicalFieldNames<Tin, Tfieldnames>(
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
    return toValidationFormError<Tfieldnames>(
      e,
      fields,
      loggerContext,
      failureMessage,
    );
  }

  // Zod validation failed
  if (!parsed.success) {
    return toValidationFormError<Tfieldnames>(
      parsed.error,
      fields,
      loggerContext,
      failureMessage,
    );
  }

  return makeFormOk<Tin>(parsed.data, successMessage);
}
