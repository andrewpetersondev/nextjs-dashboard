import "server-only";

import type * as z from "zod";
import {
  VALIDATION_FAILED_MESSAGE,
  VALIDATION_SUCCESS_MESSAGE,
} from "@/lib/constants/form.constants";
import type { FormErrors, FormState } from "@/lib/forms/form.types";
import { logger } from "@/lib/utils/logger";

/**
 * Validates FormData against a Zod schema and normalizes errors.
 *
 * @template TFieldNames - The string literal union of valid form field names.
 * @template TData - The type of the schema's output.
 * @param formData - The FormData to validate.
 * @param schema - The Zod schema to validate against.
 * @param allowedFields - An array of allowed field names to include in the error map.
 * @example
 * // import { INVOICE_FIELD_NAMES } from "@/features/invoices/invoice.types";
 * const result = validateFormData(formData, CreateInvoiceSchema, INVOICE_FIELD_NAMES);
 * @returns FormState<TFieldNames, TData>
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
      message: VALIDATION_FAILED_MESSAGE,
    });

    const { fieldErrors } = parsed.error.flatten();
    return {
      errors: mapFieldErrors(fieldErrors, allowedFields),
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

/**
 * Maps Zod field errors to a domain-specific error map.
 * Ensures only allowed field names are present.
 *
 * So far, used for creating an invoice.
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
 * Builds a typed error map for form fields, including only fields with actual errors.
 *
 * @template T - Field name type.
 * @param errors - Partial error map with possible undefined values.
 * @returns Partial error map with only fields that have errors.
 */
export const buildErrorMap = <T extends string>(
  errors: Partial<Record<T, string[] | undefined>>,
): Partial<Record<T, string[]>> => {
  const result: Partial<Record<T, string[]>> = {};
  for (const [key, value] of Object.entries(errors) as [
    T,
    string[] | undefined,
  ][]) {
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Normalizes Zod fieldErrors to a consistent Record<string, string[]> shape.
 *
 * @param fieldErrors - Zod fieldErrors object.
 * @returns Normalized error map.
 */
export const normalizeFieldErrors = (
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const key in fieldErrors) {
    if (Object.hasOwn(fieldErrors, key)) {
      result[key] = fieldErrors[key] ?? [];
    }
  }
  return result;
};
