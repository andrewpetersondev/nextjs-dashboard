import "server-only";

import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result-base";
import { mapFieldErrors, toDenseFormErrors } from "@/shared/forms/errors";
import { buildRawFromFormData, deriveFields } from "@/shared/forms/helpers";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/messages";
import type { DenseFormErrors } from "@/shared/forms/types";

/**
 * Options for `validateFormGeneric`.
 * - `transform`: Optional function to transform the input data before returning.
 * - `fields`: Optional precomputed list of allowed fields (skips derive).
 * - `raw`: Optional prebuilt raw map from FormData (skips build).
 * - `loggerContext`: Optional logger context override.
 */
export type ValidateFormOptions<TIn, TOut = TIn> = {
  transform?: (data: TIn) => TOut | Promise<TOut>;
  fields?: readonly string[];
  raw?: Record<string, unknown>;
  loggerContext?: string;
};

/**
 * Generic form validation function. Validates form data against a Zod schema. Handles field-specific errors and returns a dense error map. Logs validation errors.
 * - If validation fails: Produces a dense error map keyed by field name. Returns a Result with success: false and error: denseErrors.
 * - If validation succeeds: Applies the provided transform (normalizes email to lowercase/trim; trims username). Returns a Result with success: true and data: transformedData.
 * @typeParam TFieldNames - The type of the field names.
 * @typeParam TIn - The type of the input data.
 * @typeParam TOut - The type of the transformed output data.
 * @returns A Result object containing the validated data or an error map.
 */
export async function validateFormGeneric<
  TFieldNames extends string,
  TIn,
  TOut = TIn,
>(
  formData: FormData,
  schema: z.ZodSchema<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateFormOptions<TIn, TOut> = {},
): Promise<Result<TOut, DenseFormErrors<TFieldNames>>> {
  const {
    transform,
    fields: precomputedFields,
    raw: precomputedRaw,
    loggerContext = "validateFormGeneric",
  } = options;

  // Reuse precomputed fields/raw when provided to avoid duplicate work in callers
  const fields =
    (precomputedFields as readonly TFieldNames[] | undefined) ??
    deriveFields<TFieldNames, TIn>(schema, allowedFields);

  const raw =
    precomputedRaw ?? buildRawFromFormData<TFieldNames>(formData, fields);

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const normalized = mapFieldErrors(fieldErrors, fields);
    const dense = toDenseFormErrors(normalized, fields);

    serverLogger.error({
      context: loggerContext,
      error: parsed.error,
      message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    });

    return { error: dense, success: false };
  }

  const dataIn = parsed.data as TIn;

  try {
    const dataOut = (await (transform ? transform(dataIn) : dataIn)) as TOut;
    return { data: dataOut, success: true };
  } catch (e) {
    serverLogger.error({
      context: `${loggerContext}.transform`,
      error: e,
      message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    });
    // Transform error is non-field specific; return empty dense map for known fields
    const emptyDense = toDenseFormErrors<TFieldNames>({}, fields);
    return { error: emptyDense, success: false };
  }
}
