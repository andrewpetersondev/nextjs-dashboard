import type { z } from "zod";

/**
 * Derive a frozen, readonly tuple of keys from a Zod object schema.
 *
 * Runtime and type-safe
 * Always in sync with schema
 * Prevents accidental mutation
 */
export function getSchemaKeys<const T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): readonly (keyof T)[] {
  return Object.freeze(Object.keys(schema.shape) as readonly (keyof T)[]);
}
