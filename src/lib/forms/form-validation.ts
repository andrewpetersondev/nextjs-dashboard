import "server-only";

import { z } from "zod";
import type { ValidationResult } from "@/lib/forms/form.types";

/**
 * Default validation messages.
 */
const VALIDATION_FAILED_MESSAGE = "Validation failed.";
const VALIDATION_SUCCESS_MESSAGE = "Validation succeeded.";

/**
 * Validates FormData against a Zod schema and normalizes errors.
 *
 * @template T - The type of the schema's output.
 * @param formData - The FormData to validate.
 * @param schema - The Zod schema to validate against.
 * @param fieldMap - Optional mapping from form field names to schema keys.
 * @returns ValidationResult<T>
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>,
  fieldMap?: Record<string, string>,
): ValidationResult<T> {
  // Convert FormData to plain object
  const data = Object.fromEntries(formData.entries());

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const { fieldErrors, formErrors } = z.flattenError(parsed.error);
    const normalizedFieldErrors: Record<string, string[]> = {};

    for (const key in fieldErrors) {
      if (Object.hasOwn(fieldErrors, key)) {
        const mappedKey = fieldMap?.[key] || key;
        normalizedFieldErrors[mappedKey] = fieldErrors[key] ?? [];
      }
    }

    if (formErrors.length > 0) {
      normalizedFieldErrors._form = formErrors;
    }

    return {
      errors: normalizedFieldErrors,
      message: VALIDATION_FAILED_MESSAGE,
      success: false,
    };
  }

  return {
    data: parsed.data,
    errors: {},
    message: VALIDATION_SUCCESS_MESSAGE,
    success: true,
  };
}
