import type { z } from "zod";
import { initializeDenseErrorMap } from "@/shared/forms/errors/dense-error-map";
import type { LegacyFormState } from "@/shared/forms/types/form-state.type";

/**
 * Creates an initial failure FormState (UI-only) for a given set of fields.
 * Domain logic should use Result; actions map Result -> FormState at the boundary.
 */
export function buildInitialFailedFormState<TFieldNames extends string>(
  fieldNames: readonly TFieldNames[],
) {
  return {
    errors: initializeDenseErrorMap(fieldNames),
    message: "",
    success: false,
  } satisfies Extract<LegacyFormState<TFieldNames>, { success: false }>;
}

/**
 * Creates an initial failure state for a given Zod object schema.
 */
export function buildInitialFailedFormStateFromSchema<
  TSchema extends z.ZodObject<z.ZodRawShape>,
>(schema: TSchema) {
  // Derive the field names directly from the schema
  type FieldNames = keyof TSchema["shape"] & string;

  // Object.keys always returns string[], but narrowing it to FieldNames is safe here
  const fields = Object.keys(schema.shape) as readonly FieldNames[];
  return buildInitialFailedFormState<FieldNames>(fields);
}
