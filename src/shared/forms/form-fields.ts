import type { z } from "zod";
import { deriveAllowedFieldsFromSchema } from "@/shared/forms/schema-helpers";
import { isZodObject } from "@/shared/forms/zod-guards";

export function deriveFields<TFieldNames extends string, TIn>(
  schema: z.ZodSchema<TIn>,
  allowedFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  if (allowedFields && allowedFields.length > 0) {
    return allowedFields;
  }
  return isZodObject(schema)
    ? (deriveAllowedFieldsFromSchema(schema) as readonly TFieldNames[])
    : ([] as const);
}
