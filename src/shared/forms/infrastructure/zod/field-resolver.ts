import type { z } from "zod";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/field-names";
import { isZodObjectSchema } from "@/shared/forms/infrastructure/zod/guards";

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
  Tin,
  Tfieldnames extends keyof Tin & string,
>(
  schema: z.ZodType<Tin>,
  allowedSubset?: readonly Tfieldnames[],
  explicitFields?: readonly Tfieldnames[],
): readonly Tfieldnames[] {
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
    ? (deriveFieldNamesFromSchema(schema) as readonly Tfieldnames[])
    : ([] as const);
}
