import "server-only";

import type { z } from "zod";
import { isZodObject } from "@/shared/forms/guards";
import { deriveAllowedFieldsFromSchema } from "@/shared/forms/schema";

// --- helpers (core) ---

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

export function buildRawFromFormData<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  const keys: string[] =
    fields.length > 0
      ? (fields as readonly string[]).slice()
      : Array.from(new Set(Array.from(formData.keys())));

  for (const key of keys) {
    const v = formData.get(key);
    if (v !== null) {
      raw[key] = v;
    }
  }
  return raw;
}
