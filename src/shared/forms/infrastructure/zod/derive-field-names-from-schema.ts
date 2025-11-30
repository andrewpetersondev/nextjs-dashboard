import type { z } from "zod";

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
