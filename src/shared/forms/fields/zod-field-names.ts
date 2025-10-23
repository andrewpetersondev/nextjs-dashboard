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
 * Derive a readonly list of form field names for a given Zod schema.
 *
 * @typeParam TFieldNames - String literal union of field names (e.g., keyof Input).
 * @typeParam TIn - Input type expected by the Zod schema.
 *
 * @param schema - Zod schema describing the form payload.
 * @param allowedFields - Optional explicit whitelist of fields to use instead of deriving.
 * @returns Readonly array of field names.
 *
 * @remarks
 * - If {@link allowedFields} is provided and non-empty, it is returned as-is (explicit whitelist).
 * - Otherwise, if {@link schema} is a Zod object, field names are derived from the schema shape.
 * - If {@link schema} is not a Zod object (e.g., union/array/primitive), an empty readonly array is returned.
 */
export function resolveFieldNamesFromSchema<TFieldNames extends string, TIn>(
  schema: z.ZodSchema<TIn>,
  allowedFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  // Prefer explicit whitelist when provided.
  if (allowedFields && allowedFields.length > 0) {
    return allowedFields;
  }
  // Derive from object schemas; otherwise, return an empty readonly list.
  return isZodObjectSchema(schema)
    ? (deriveFieldNamesFromSchema(schema) as readonly TFieldNames[])
    : ([] as const);
}

/**
 * Resolve the canonical list of field names.
 *
 * Prefers an explicit list; otherwise derives from the schema and allowed subset.
 */
export function resolveCanonicalFieldNamesFromSchema<
  TIn,
  TFieldNames extends keyof TIn & string,
>(
  schema: z.ZodType<TIn>,
  allowedSubset?: readonly TFieldNames[],
  explicitFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  if (explicitFields && explicitFields.length > 0) {
    return explicitFields;
  }
  return resolveFieldNamesFromSchema<TFieldNames, TIn>(schema, allowedSubset);
}
