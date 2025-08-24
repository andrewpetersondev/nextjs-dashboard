import type { z } from "zod";
import type { FieldErrors, FormErrors } from "@/shared/forms/types";

/**
 * Derive allowed string field names from a Zod schema.
 *
 * Extracts the string keys from the given Zod object schema and returns them
 * as a readonly array.
 *
 * @typeParam S - A Zod object schema whose keys are to be extracted.
 * @param schema - The Zod object schema to extract keys from.
 * @returns Readonly array of string keys from the schema.
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * const fields = deriveAllowedFieldsFromSchema(userSchema);
 * // fields: readonly ["name", "age"]
 * ```
 */
export function deriveAllowedFieldsFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): readonly Extract<keyof z.infer<S>, string>[] {
  type Keys = Extract<keyof z.infer<S>, string>;
  const keys = Object.keys(schema.shape) as Keys[];
  return keys as readonly Keys[];
}

/**
 * Map field-specific errors to an allowed subset of fields.
 *
 * Filters the given field errors based on the allowed field names and returns
 * a structured object containing only the matched errors.
 *
 * @param fieldErrors - Record of all field errors keyed by field name, where
 * each value is an array of error messages or undefined.
 * @param allowedFields - Array of allowed field names to include in the result.
 * @returns An object containing errors only for the allowed fields, with the
 * same structure as the input but filtered.
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
 * Normalize a record of field errors into a uniform structure.
 *
 * Ensures every field key maps to an array of errors, defaulting to an empty array if undefined.
 *
 * @param fieldErrors - A record where keys are field names and values are arrays of error messages or undefined.
 * @returns A normalized record where each key maps to an array of strings (error messages).
 *          Keys with undefined values are mapped to empty arrays.
 * @example
 * ```typescript
 * const errors = { name: ["Required"], age: undefined };
 * const normalized = normalizeFieldErrors(errors);
 * console.log(normalized); // { name: ["Required"], age: [] }
 * ```
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
