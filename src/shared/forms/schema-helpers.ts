/**
 * @file Utilities for deriving field-name lists from Zod schemas.
 *
 * @remarks
 * Primary goals:
 * - Centralize allowed form field names per schema.
 * - Provide canonical field lists to build raw form-data maps and dense error maps.
 * - Reduce over-posting risk by supporting explicit whitelists.
 */

import type { z } from "zod";
import { isZodObject } from "@/shared/forms/zod-guards";

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
 *
 * @example
 * ```ts
 * const keys = deriveAllowedFieldsFromSchema(UserSchema);
 * // -> ["id", "email", "name"] as const
 * ```
 */
export function deriveAllowedFieldsFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): readonly Extract<keyof z.infer<S>, string>[] {
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
 *
 * @example
 * ```ts
 * // Derive from schema (Zod object):
 * const fields = deriveFields<LoginFieldNames, LoginInput>(LoginSchema);
 * ```
 *
 * @example
 * ```ts
 * // Use an explicit whitelist (skips derivation):
 * const fields = deriveFields<EditUserFieldNames, EditUserInput>(
 *   EditUserSchema,
 *   ["email", "username"] as const
 * );
 * ```
 */
export function deriveFields<TFieldNames extends string, TIn>(
  schema: z.ZodSchema<TIn>,
  allowedFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  // Prefer explicit whitelist when provided.
  if (allowedFields && allowedFields.length > 0) {
    return allowedFields;
  }
  // Derive from object schemas; otherwise, return an empty readonly list.
  return isZodObject(schema)
    ? (deriveAllowedFieldsFromSchema(schema) as readonly TFieldNames[])
    : ([] as const);
}
