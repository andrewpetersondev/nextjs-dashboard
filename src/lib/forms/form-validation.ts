import "server-only";

import type * as z from "zod";
import type { FormState } from "@/lib/forms/form.types";

/**
 * Default validation messages.
 */
const VALIDATION_FAILED_MESSAGE = "Validation failed.";
const VALIDATION_SUCCESS_MESSAGE = "Validation succeeded.";

/**
 * Validates FormData against a Zod schema and normalizes errors.
 *
 * @template TFieldNames - The string literal union of valid form field names.
 * @template TData - The type of the schema's output.
 * @param formData - The FormData to validate.
 * @param schema - The Zod schema to validate against.
 * @returns FormState<TFieldNames, TData>
 */
export function validateFormData<
  TFieldNames extends string = string,
  TData = unknown,
>(
  formData: FormData,
  schema: z.ZodSchema<TData>,
): FormState<TFieldNames, TData> {
  const data = Object.fromEntries(formData.entries()); // what is the shape of data?
  const parsed = schema.safeParse(data); // what is the shape of parsed?

  if (!parsed.success) {
    // normalize Zod errors to FormState shape
    const { fieldErrors } = parsed.error.flatten();
    return {
      errors: fieldErrors as Partial<Record<TFieldNames, string[]>>,
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
