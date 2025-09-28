/**
 * @file Map validation errors to UI-friendly shapes.
 *
 * Transforms sparse/dense error maps scoped to allowed field names.
 */

import type { z } from "zod";
import { buildEmptyDenseErrorMap } from "@/shared/forms/mapping/error-utils";
import type { FormState } from "@/shared/forms/types/form-state";

/**
 * Creates an initial failure state for a given set of form fields.
 */
export function buildInitialFailedFormState<TFieldNames extends string>(
  fieldNames: readonly TFieldNames[],
) {
  return {
    errors: buildEmptyDenseErrorMap(fieldNames),
    message: "",
    success: false,
  } satisfies Extract<FormState<TFieldNames>, { success: false }>;
}

/**
 * Creates an initial failure state for a given Zod object schema.
 */
export function buildInitialFailedFormStateFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S) {
  // Derive the field names directly from the schema
  type FieldNames = keyof S["shape"] & string;

  // Object.keys always returns string[], but narrowing it to FieldNames is safe here
  const fields = Object.keys(schema.shape) as readonly FieldNames[];
  return buildInitialFailedFormState<FieldNames>(fields);
}
