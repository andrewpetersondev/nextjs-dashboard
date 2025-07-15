import "server-only";

import * as z from "zod";
import type { FormState } from "@/lib/forms/form.types";
import { logger } from "@/lib/utils/logger";

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
  const data = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    logger.error({
      context: "validateFormData",
      data,
      error: parsed.error,
      message: VALIDATION_FAILED_MESSAGE,
    });

    // normalize Zod errors to FormState shape
    const { fieldErrors } = parsed.error.flatten(); // this works as expected
    // const fieldErrors = z.treeifyError(parsed.error);
    return {
      errors: fieldErrors as Partial<Record<TFieldNames, string[]>>,
      message: VALIDATION_FAILED_MESSAGE,
      success: false,
    };
  }

  if (parsed.data) {
  }

  return {
    data: parsed.data,
    errors: {},
    message: VALIDATION_SUCCESS_MESSAGE,
    success: true,
  };
}
