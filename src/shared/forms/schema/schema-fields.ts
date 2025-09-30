import type { z } from "zod";
import { isZodObjectSchema } from "@/shared/forms/mapping/zod-mapping";
import { extractRawFromFormData } from "@/shared/forms/utils/formdata";

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
export function deriveSchemaFieldNames<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
): readonly Extract<keyof z.infer<S>, string>[] {
  // Narrow the keys of the inferred object to strings only.
  type Keys = Extract<keyof z.infer<S>, string>;
  // Read the schema's shape keys (object property names).
  const keys = Object.keys(schema.shape) as Keys[];
  // Return as a readonly array to signal immutability to callers.
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
export function resolveSchemaFieldNames<TFieldNames extends string, TIn>(
  schema: z.ZodSchema<TIn>,
  allowedFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  // Prefer explicit whitelist when provided.
  if (allowedFields && allowedFields.length > 0) {
    return allowedFields;
  }
  // Derive from object schemas; otherwise, return an empty readonly list.
  return isZodObjectSchema(schema)
    ? (deriveSchemaFieldNames(schema) as readonly TFieldNames[])
    : ([] as const);
}

/**
 * Resolve the canonical list of field names.
 *
 * Prefers an explicit list; otherwise derives from the schema and allowed subset.
 */
export function resolveCanonicalFieldNames<
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
  return resolveSchemaFieldNames<TFieldNames, TIn>(schema, allowedSubset);
}

/**
 * Project an arbitrary raw map to the exact allowed field set.
 *
 * Ensures deterministic shape and ignores extraneous keys.
 */
export function projectRawToAllowedFields<TFieldNames extends string>(
  raw: Readonly<Partial<Record<TFieldNames, unknown>>> | undefined,
  fields: readonly TFieldNames[],
): Record<TFieldNames, unknown> {
  if (!raw) {
    return {} as Record<TFieldNames, unknown>;
  }
  const out: Partial<Record<TFieldNames, unknown>> = {};
  for (const f of fields) {
    if (Object.hasOwn(raw, f)) {
      out[f] = raw[f];
    }
  }
  return out as Record<TFieldNames, unknown>;
}

/**
 * Resolve the raw payload:
 * - If an explicit raw map is provided and non-empty, project it.
 * - Otherwise, build from FormData.
 */
export function resolveRawFieldPayload<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
  explicitRaw?: Readonly<Partial<Record<TFieldNames, unknown>>>,
): Record<TFieldNames, unknown> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    return projectRawToAllowedFields(explicitRaw, fields);
  }
  return extractRawFromFormData<TFieldNames>(formData, fields);
}
