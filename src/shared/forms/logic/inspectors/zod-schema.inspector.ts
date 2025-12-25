import type { z } from "zod";
import { isZodObjectSchema } from "@/shared/forms/core/guards/zod.guard";

/**
 * Extracts the string keys from a Zod object schema as a frozen array.
 * Use this to get field names for form initialization or mapping.
 */
export function extractSchemaFieldNames<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
): readonly (keyof S["shape"] & string)[] {
  return Object.freeze(
    Object.keys(schema.shape),
  ) as readonly (keyof S["shape"] & string)[];
}

/**
 * Resolves the canonical array of field names for a Zod schema.
 * Respects explicit field lists if provided.
 */
export function resolveCanonicalFieldNames<T, K extends keyof T & string>(
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
    ? (extractSchemaFieldNames(schema) as readonly K[])
    : (Object.freeze([]) as readonly K[]);
}

/**
 * Derive a frozen, readonly tuple of keys from a Zod object schema.
 *
 * Runtime and type-safe
 * Always in sync with schema
 * Prevents accidental mutation
 */
export function toSchemaKeys<const T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): readonly (keyof T)[] {
  return Object.freeze(Object.keys(schema.shape) as readonly (keyof T)[]);
}
