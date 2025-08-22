import * as z from "zod";

import type { FieldErrors, FormErrors } from "@/shared/forms/types";

export function isZodObject(
  schema: z.ZodTypeAny,
): schema is z.ZodObject<z.ZodRawShape> {
  return schema instanceof z.ZodObject;
}

// Helper: derive allowed field names from a Zod object schema
export function deriveAllowedFieldsFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): ReadonlyArray<Extract<keyof z.infer<S>, string>> {
  type Keys = Extract<keyof z.infer<S>, string>;
  const keys = Object.keys(schema.shape) as Keys[];
  return keys as ReadonlyArray<Keys>;
}

/**
 * Maps Zod field errors to a domain-specific error map.
 *
 * @template TFieldNames - String literal union of valid field names.
 * @param fieldErrors - Zod field errors object.
 * @param allowedFields - Array of allowed field names.
 */
export function mapFieldErrors<TFieldNames extends string>(
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
): FieldErrors {
  const result: FieldErrors = {};
  for (const key in fieldErrors) {
    if (Object.hasOwn(fieldErrors, key)) {
      result[key] = fieldErrors[key] ?? [];
    }
  }
  return result;
}
