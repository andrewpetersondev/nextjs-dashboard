import "server-only";

import type { z } from "zod";
import { buildRawFromFormData, deriveFields } from "@/server/forms/helpers";
import type { ValidateFormOptions } from "@/server/forms/types";
import { serverLogger } from "@/server/logging/serverLogger";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/messages";
import type { DenseFormErrors } from "@/shared/forms/types";
import { mapFieldErrors, toDenseFormErrors } from "@/shared/forms/utils";
import type { Result } from "@/shared/result/result-base";

// --- Core API: single Result return (normalized errors) ---
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
  const { transform } = options;

  const fields = deriveFields(schema, allowedFields);
  const raw = buildRawFromFormData(formData, fields);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const normalized = mapFieldErrors(fieldErrors, fields);
    const dense = toDenseFormErrors(normalized, fields);

    serverLogger.error({
      context: "validateFormGeneric",
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
      context: "validateFormGeneric.transform",
      error: e,
      message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    });
    // Transform error is non-field specific; return empty dense map for known fields
    const emptyDense = toDenseFormErrors<TFieldNames>({}, fields);
    return { error: emptyDense, success: false };
  }
}
