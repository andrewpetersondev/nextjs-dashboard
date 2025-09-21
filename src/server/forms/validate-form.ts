/**
 * @file Generic server-side form validation utilities.
 *
 * Provides a typed, reusable validator that:
 * - Derives or accepts allowed field names for a schema.
 * - Projects `FormData` into a plain raw map limited to allowed fields.
 * - Validates using Zod and returns a dense error map on failure.
 * - Optionally transforms validated data.
 * - Logs failures with contextual information.
 */
import "server-only";

import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result-base";
import {
  mapFieldErrors,
  toDenseFormErrors,
} from "@/shared/forms/error-mapping";
import { formDataToRawMap } from "@/shared/forms/form-data";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/form-messages";
import type { DenseFormErrors } from "@/shared/forms/form-types";
import { deriveFields } from "@/shared/forms/schema-helpers";

/**
 * Options for `validateFormGeneric`.
 *
 * @typeParam TIn - Input type of the schema.
 * @typeParam TOut - Output type after optional transform (defaults to `TIn`).
 *
 * @property transform - Optional function to transform validated input prior to returning.
 * @property fields - Optional precomputed field list (skips derivation).
 * @property raw - Optional prebuilt raw map from `FormData` (skips building).
 * @property loggerContext - Optional logger context label.
 */
export type ValidateFormOptions<TIn, TOut = TIn> = {
  transform?: (data: TIn) => TOut | Promise<TOut>;
  fields?: readonly string[];
  raw?: Record<string, unknown>;
  loggerContext?: string;
};

/**
 * Validate `FormData` against a Zod schema and return a `Result`.
 *
 * Behavior:
 * - Builds or reuses a canonical `fields` list and corresponding `raw` payload.
 * - `schema.safeParse(raw)` drives validation; on failure, returns dense errors keyed by known fields.
 * - On success, applies an optional `transform` to the validated data and returns it.
 * - Errors are logged with `serverLogger` using `loggerContext`.
 *
 * Safety:
 * - Dense error map ensures consumers can render per-field errors deterministically.
 * - When `transform` throws, returns an empty dense map (no field-specific errors).
 *
 * @typeParam TFieldNames - Union of field-name literals.
 * @typeParam TIn - Input shape expected by `schema`.
 * @typeParam TOut - Output shape after `transform` (defaults to `TIn`).
 *
 * @param formData - Incoming form data to validate.
 * @param schema - Zod schema used for validation.
 * @param allowedFields - Optional explicit whitelist of field names; merged with `deriveFields` fallback.
 * @param options - Advanced options (precomputed `fields`/`raw`, transform, logging).
 *
 * @returns Result containing either:
 * - `{ success: true, data }` on success (post-transform if provided), or
 * - `{ success: false, error: DenseFormErrors }` on failure.
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

  const raw = precomputedRaw ?? formDataToRawMap<TFieldNames>(formData, fields);

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
