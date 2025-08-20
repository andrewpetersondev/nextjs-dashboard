import "server-only";

import type * as z from "zod";
import { FORM_VALIDATION_ERROR_MESSAGES } from "@/errors/error-messages";
import { FORM_VALIDATION_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { FormErrors, FormState } from "@/lib/forms/form.types";
import { logger } from "@/lib/logging/logger";

/**
 * Validates FormData against a Zod schema and normalizes errors.
 *
 * @template TFieldNames - String literal union of valid form field names.
 * @template TData - Type of the schema's output.
 * @param formData - The FormData to validate.
 * @param schema - The Zod schema to validate against.
 * @param allowedFields - Array of allowed field names to include in the error map.
 */
export function validateFormData<TFieldNames extends string, TData = unknown>(
  formData: FormData,
  schema: z.ZodSchema<TData>,
  allowedFields: readonly TFieldNames[],
): FormState<TFieldNames, TData> {
  const data = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    logger.error({
      context: "validateFormData",
      data,
      error: parsed.error,
      message: FORM_VALIDATION_ERROR_MESSAGES.FAILED_VALIDATION,
    });

    const { fieldErrors } = parsed.error.flatten();

    // Build non-sensitive raw values for repopulating the form.
    const values: Partial<Record<TFieldNames, string>> = {};
    for (const key of allowedFields) {
      // Avoid echoing sensitive fields like passwords
      if (key === ("password" as TFieldNames)) continue;
      const v = data[key as string];
      if (typeof v === "string") {
        values[key] = v;
      }
    }

    return {
      errors: mapFieldErrors(fieldErrors, allowedFields),
      message: FORM_VALIDATION_ERROR_MESSAGES.FAILED_VALIDATION,
      success: false,
      values,
    };
  }

  return {
    data: parsed.data,
    message: FORM_VALIDATION_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    success: true,
  };
}

/**
 * Maps Zod field errors to a domain-specific error map.
 *
 * @template TFieldNames - String literal union of valid field names.
 * @param fieldErrors - Zod field errors object.
 * @param allowedFields - Array of allowed field names.
 */
function mapFieldErrors<TFieldNames extends string>(
  fieldErrors: Record<string, string[] | undefined>,
  allowedFields: readonly TFieldNames[],
): FormErrors<TFieldNames> {
  const errors: FormErrors<TFieldNames> = {};
  for (const key of allowedFields) {
    if (fieldErrors[key]) {
      errors[key] = fieldErrors[key];
    }
  }
  return errors;
}

/**
 * Normalizes Zod fieldErrors to a consistent Record<string, string[]> shape.
 */
export function normalizeFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key in fieldErrors) {
    if (Object.hasOwn(fieldErrors, key)) {
      result[key] = fieldErrors[key] ?? [];
    }
  }
  return result;
}
