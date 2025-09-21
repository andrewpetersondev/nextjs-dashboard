import type { z } from "zod";

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
