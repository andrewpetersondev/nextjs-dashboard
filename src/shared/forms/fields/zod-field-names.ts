import type { z } from "zod";
import { isZodObjectSchema } from "@/shared/forms/validation/utils/zod-error.helpers";

/**
 * Derive allowed string field names from a Zod object schema.
 *
 * Extracts the string keys from the provided Zod object schema and returns them
 * as an immutable (readonly) array.
 *
 * @typeParam S - A Zod object schema whose keys are to be extracted.
 * @param schema - The Zod object schema to extract keys from.
 * @returns Readonly array of string keys from the schema.
 *
 * @remarks
 * - Only object schemas are supported; callers should pass a `ZodObject`.
 * - Keys are narrowed to `string` (symbol keys are excluded).
 */
export function deriveFieldNamesFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): readonly Extract<keyof z.output<S>, string>[] {
  type Keys = Extract<keyof z.output<S>, string>;
  const keys = Object.keys(schema.shape) as Keys[];
  return keys as readonly Keys[];
}

/**
 * Resolve the canonical list of field names for a given Zod schema.
 *
 * @typeParam TFieldNames - String literal union of field names (e.g., keyof Input).
 * @typeParam TIn - Input type expected by the Zod schema.
 *
 * @param schema - Zod schema describing the form payload.
 * @param allowedSubset - Optional subset of fields to validate (takes precedence over schema).
 * @param explicitFields - Optional explicit whitelist (highest priority).
 * @returns Readonly array of field names.
 *
 * @remarks
 * Priority:
 * 1. If {@link explicitFields} is provided and non-empty, it is returned as-is.
 * 2. Otherwise, if {@link allowedSubset} is provided and non-empty, it is returned.
 * 3. Otherwise, if {@link schema} is a Zod object, field names are derived from the schema shape.
 * 4. If {@link schema} is not a Zod object (e.g., union/array/primitive), an empty readonly array is returned.
 */
export function resolveCanonicalFieldNamesFromSchema<
  TIn,
  TFieldNames extends keyof TIn & string,
>(
  schema: z.ZodType<TIn>,
  allowedSubset?: readonly TFieldNames[],
  explicitFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  // Priority 1: Explicit whitelist
  if (explicitFields && explicitFields.length > 0) {
    return explicitFields;
  }

  // Priority 2: Allowed subset
  if (allowedSubset && allowedSubset.length > 0) {
    return allowedSubset;
  }

  // Priority 3: Derive from object schemas; otherwise, return empty
  return isZodObjectSchema(schema)
    ? (deriveFieldNamesFromSchema(schema) as readonly TFieldNames[])
    : ([] as const);
}
