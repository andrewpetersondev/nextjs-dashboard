import "server-only";

import type { z } from "zod";
import { makeFormOk } from "@/shared/forms/factories/form-result.factory";
import { resolveFormValidationOptions } from "@/shared/forms/factories/form-validation-options.factory";
import { resolveRawFieldPayload } from "@/shared/forms/infrastructure/form-data-extractor";
import { toValidationFormError } from "@/shared/forms/server/to-validation-form.error";
import type { FormResult } from "@/shared/forms/types/form-result.dto";
import type { FormValidationOptions } from "@/shared/forms/types/form-validation.dto";
import { resolveCanonicalFieldNames } from "@/shared/forms/zod/schema-inspector";

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
