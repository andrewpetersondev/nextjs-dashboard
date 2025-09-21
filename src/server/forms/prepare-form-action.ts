/**
 * @file Server-side helper to prepare common data for form actions.
 *
 * Delegates validation to `validateFormGeneric` and standardizes:
 * - Field-name derivation (from schema or explicit list)
 * - Raw FormData projection limited to known fields
 * - Empty dense error shape aligned to the field list
 * - Conversion into UI-facing `FormState`
 *
 * This avoids duplicating raw/fields/error-shape logic across server actions.
 */
import type { z } from "zod";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { toDenseFormErrors } from "@/shared/forms/error-mapping";
import { formDataToRawMap } from "@/shared/forms/form-data";
import type { FormState } from "@/shared/forms/form-types";
import { toFormState } from "@/shared/forms/result-to-form-state";
import { deriveFields } from "@/shared/forms/schema-helpers";

/**
 * Prepare all common artifacts for a server form action and run validation.
 *
 * Responsibilities:
 * - Derive or accept a canonical `fields` list for the schema.
 * - Build a `raw` payload (plain object) from `FormData`, limited to `fields`.
 * - Precompute an `emptyDense` error structure aligned to `fields`.
 * - Delegate to `validateFormGeneric` (passing precomputed `fields` and `raw`).
 * - Adapt the result to `FormState` for UI consumption.
 *
 * Notes:
 * - Values in `raw` are not coerced (e.g., may include `File`), suitable for echoing.
 * - On success, `validated.success === true` and includes data.
 * - On failure, `validated.success === false` with sparse field errors and safe echoed values.
 *
 * @typeParam TFieldNames - Union of string literal field names.
 * @typeParam TInput - Input shape expected by the provided Zod schema.
 *
 * @param opts - Configuration for the preparation and validation step.
 * @param opts.formData - The incoming `FormData` from a request.
 * @param opts.schema - Zod schema used for validation.
 * @param opts.fields - Optional explicit whitelist of field names; if omitted, derived from the schema (if object).
 * @param opts.transform - Optional async/sync transform applied to validated data before returning.
 *
 * @returns Object containing:
 * - `emptyDense`: Dense error map with all fields present and empty arrays.
 * - `fields`: The canonical, readonly list of field names used.
 * - `raw`: The raw payload projected from `FormData` for those fields.
 * - `validated`: A `FormState` ready for UI.
 *
 * @example
 * const { validated } = await prepareFormAction({
 *   formData: fd,
 *   schema: LoginSchema,
 *   transform: d => ({ ...d, email: d.email.toLowerCase().trim() }),
 * });
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
