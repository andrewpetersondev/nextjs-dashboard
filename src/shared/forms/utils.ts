import type { z } from "zod";
import type { DenseFormErrors, FormErrors } from "@/shared/forms/types";

/**
 * Derive allowed string field names from a Zod schema.
 *
 * Extracts the string keys from the given Zod object schema and returns them
 * as a readonly array.
 *
 * @typeParam S - A Zod object schema whose keys are to be extracted.
 * @param schema - The Zod object schema to extract keys from.
 * @returns Readonly array of string keys from the schema.
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
    const maybeErrors = fieldErrors[key];
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      // Assert non-empty readonly tuple to satisfy FormFieldError
      errors[key] = maybeErrors as unknown as readonly [string, ...string[]];
    }
  }
  return errors;
}

/**
 * Convert sparse FormErrors into a dense, per-field error map.
 *
 * - For fields without errors, an empty readonly array is provided.
 * - Keeps the type narrowed to the allowed field names.
 */
export function toDenseFormErrors<TFieldNames extends string>(
  errors: FormErrors<TFieldNames>,
  allowedFields: readonly TFieldNames[],
): DenseFormErrors<TFieldNames> {
  const dense: Partial<Record<TFieldNames, readonly string[]>> = {};
  for (const key of allowedFields) {
    const e = errors[key];
    dense[key] = e ? (e as readonly string[]) : [];
  }
  return dense as DenseFormErrors<TFieldNames>;
}
