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
 * @template TFieldNames - String literal union of valid form field names.
 * @template TData - Type of the schema's output.
 * @param formData - The FormData to validate.
 * @param schema - The Zod schema to validate against.
 * @param allowedFields - Array of allowed field names to include in the error map.
 * @returns FormState<TFieldNames, TData> - Typed form state including errors, message, success, and optional data.
 *
 * @example
 * type FieldNames = "email" | "password";
 * const result = validateFormData(formData, schema, ["email", "password"]);
 *
 * @remarks
 * - Error messages should be localized for internationalization.
 * - Use ARIA attributes for accessible error feedback in the UI.
 * - Compatible with strict TypeScript settings (`exactOptionalPropertyTypes: true`).
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
 *
 * @template TFieldNames - String literal union of valid field names.
 * @param fieldErrors - Zod field errors object.
 * @param allowedFields - Array of allowed field names.
 * @returns FormErrors<TFieldNames> - Error map including only allowed fields with errors.
 *
 * @remarks
 * - Only fields present in `allowedFields` are included.
 * - Compatible with strict TypeScript settings.
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
 * @template TFieldNames - String literal union of valid field names.
 * @param errors - Partial error map with possible undefined values.
 * @returns Partial<Record<TFieldNames, string[]>> - Error map with only fields that have errors.
 *
 * @remarks
 * - Filters out fields with no errors or empty arrays.
 */
export function buildErrorMap<TFieldNames extends string>(
  errors: Partial<Record<TFieldNames, string[] | undefined>>,
): Partial<Record<TFieldNames, string[]>> {
  const result: Partial<Record<TFieldNames, string[]>> = {};
  for (const [key, value] of Object.entries(errors) as [
    TFieldNames,
    string[] | undefined,
  ][]) {
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Normalizes Zod fieldErrors to a consistent Record<string, string[]> shape.
 *
 * @param fieldErrors - Zod fieldErrors object.
 * @returns Record<string, string[]> - Normalized error map.
 *
 * @remarks
 * - Ensures all fields have an array (empty if no errors).
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
