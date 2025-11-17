import type { z } from "zod";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod-field-names.derive";
import { isZodObjectSchema } from "@/shared/forms/infrastructure/zod-guards";

/**
 * Resolve the canonical array of field names for a Zod schema.
 *
 * @typeParam Tinput - The input type the Zod schema validates.
 * @typeParam TfieldNames - String literal union of valid field names (e.g., `keyof TInput & string`).
 *
 * @param schema - Zod schema describing the payload.
 * @param allowedSubset - Optional subset of fields to validate (used if `explicitFields` is absent).
 * @param explicitFields - Optional explicit whitelist; highest priority when non-empty.
 * @returns Readonly array of resolved field names.
 *
 * @remarks
 * Resolution priority:
 * 1. `explicitFields` when provided and non-empty.
 * 2. `allowedSubset` when provided and non-empty.
 * 3. Field names derived from `schema` when it is a Zod object.
 * 4. Empty readonly array for non-object schemas.
 */
export function resolveCanonicalFieldNamesFromSchema<
  Tinput,
  TfieldNames extends keyof Tinput & string,
>(
  schema: z.ZodType<Tinput>,
  allowedSubset?: readonly TfieldNames[],
  explicitFields?: readonly TfieldNames[],
): readonly TfieldNames[] {
  // Priority 1: explicit whitelist
  if (explicitFields && explicitFields.length > 0) {
    return explicitFields;
  }

  // Priority 2: allowed subset
  if (allowedSubset && allowedSubset.length > 0) {
    return allowedSubset;
  }

  // Priority 3: derive from object schema; otherwise return empty readonly array
  return isZodObjectSchema(schema)
    ? (deriveFieldNamesFromSchema(schema) as readonly TfieldNames[])
    : ([] as const);
}
