import type { z } from "zod";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/derive-field-names-from-schema";
import { isZodObjectSchema } from "@/shared/forms/infrastructure/zod/zod-guards";

/**
 * Resolve the canonical array of field names for a Zod schema.
 *
 * @typeParam T - The input type the Zod schema validates.
 * @typeParam K - String literal union of valid field names (e.g., `keyof T & string`).
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
  T,
  K extends keyof T & string,
>(
  schema: z.ZodType<T>,
  allowedSubset?: readonly K[],
  explicitFields?: readonly K[],
): readonly K[] {
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
    ? (deriveFieldNamesFromSchema(schema) as readonly K[])
    : ([] as const);
}
