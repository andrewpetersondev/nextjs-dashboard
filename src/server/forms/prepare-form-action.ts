import type { z } from "zod";
import { validateFormGeneric } from "@/server/forms/validation";
import { toDenseFormErrors } from "@/shared/forms/error-mapping";
import { formDataToRawMap } from "@/shared/forms/form-data";
import type { FormState } from "@/shared/forms/form-types";
import { toFormState } from "@/shared/forms/result-to-form-state";
import { deriveFields } from "@/shared/forms/schema-helpers";

/**
 * Prepares common data for server form actions by delegating validation to validateFormGeneric.
 * Avoids duplicating raw/fields/error-shape logic here.
 */
export async function prepareFormAction<
  TFieldNames extends string,
  TInput extends Record<string, unknown>,
>(opts: {
  formData: FormData;
  fields?: readonly TFieldNames[];
  schema: z.ZodSchema<TInput>;
  transform?: (d: TInput) => TInput | Promise<TInput>;
}): Promise<{
  emptyDense: Readonly<Record<TFieldNames, readonly string[]>>;
  fields: readonly TFieldNames[];
  raw: Readonly<Record<string, unknown>>;
  validated: FormState<TFieldNames, TInput>;
}> {
  const { formData, schema, transform } = opts;
  // If fields are not supplied, derive from schema once here
  const fields =
    (opts.fields as readonly TFieldNames[] | undefined) ??
    deriveFields<TFieldNames, TInput>(schema);

  // Centralized raw builder used across the app
  const raw = formDataToRawMap<TFieldNames>(formData, fields);

  // Pre-build empty dense error object aligned to provided/derived fields
  const emptyDense = toDenseFormErrors<TFieldNames>({}, fields);

  // Validate using shared function; pass precomputed fields/raw to avoid recompute
  const result = await validateFormGeneric<TFieldNames, TInput>(
    formData,
    schema,
    fields,
    { fields, raw, transform },
  );

  // Convert to FormState structure expected by UI
  const validated = toFormState(result, { fields, raw });

  return {
    emptyDense,
    fields,
    raw,
    validated,
  };
}
