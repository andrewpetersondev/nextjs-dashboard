import "server-only";

import type * as z from "zod";

import { logger } from "@/server/logging/logger";

import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/messages";
import type { FieldErrors, FormState } from "@/shared/forms/types";
import {
  deriveAllowedFieldsFromSchema,
  isZodObject,
  mapFieldErrors,
  normalizeFieldErrors,
} from "@/shared/forms/utils";
import type { Result } from "@/shared/result/result-base";

export type ValidateFormOptions<TFieldNames extends string, TIn, TOut = TIn> = {
  transform?: (data: TIn) => TOut | Promise<TOut>;
  returnMode?: "form" | "result";
  messages?: {
    success?: string;
    failure?: string;
  };
  redactFields?: readonly TFieldNames[];
};

/**
 * Generic form validation function that supports data transformation and flexible return types.
 *
 * @typeParam TFieldNames - String literal union of valid form field names
 * @typeParam TIn - Input type the form data is parsed into
 * @typeParam TOut - Optional output type after transformation (defaults to TIn)
 *
 * @param formData - The FormData object to validate
 * @param schema - Zod schema to validate the form data against
 * @param allowedFields - Array of allowed field names
 * @param options - Optional configuration for validation behavior
 *
 * @remarks
 * - In "form" mode: returns FormState for easy use in server actions.
 * - In "result" mode: returns Result for pipelines or functional handlers.
 *
 * @example
 * ```typescript
 * // TypeScript
 * const res = await validateFormGeneric(formData, SignupSchema, ["email","password","username"], {
 *   transform: d => ({ ...d, email: d.email.toLowerCase().trim() }),
 *   returnMode: "result",
 * });
 * ```
 *
 * @returns Promise resolving to either FormState or Result based on returnMode option
 */
export async function validateFormGeneric<
  TFieldNames extends string,
  TIn,
  TOut = TIn,
>(
  formData: FormData,
  schema: z.ZodSchema<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateFormOptions<TFieldNames, TIn, TOut> = {},
): Promise<FormState<TFieldNames, TOut> | Result<TOut, FieldErrors>> {
  const {
    transform,
    returnMode = "form",
    messages,
    redactFields = ["password" as TFieldNames],
  } = options;

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  // Derive fields if not provided, without using `any`
  const fields =
    allowedFields ??
    (isZodObject(schema)
      ? (deriveAllowedFieldsFromSchema(schema) as ReadonlyArray<TFieldNames>)
      : ([] as const));

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    const normalized = mapFieldErrors(fieldErrors, fields);

    if (returnMode === "result") {
      const denseErrors = normalizeFieldErrors(
        normalized as Record<string, string[] | undefined>,
      );
      return { error: denseErrors, success: false };
    }

    const values: Partial<Record<TFieldNames, string>> = {};
    for (const key of fields) {
      if (redactFields.includes(key)) {
        continue;
      }
      const v = raw[key as string];
      if (typeof v === "string") {
        values[key] = v;
      }
    }

    logger.error({
      context: "validateFormGeneric",
      error: parsed.error,
      message: messages?.failure ?? FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    });

    return {
      errors: normalized,
      message: messages?.failure ?? FORM_ERROR_MESSAGES.FAILED_VALIDATION,
      success: false,
      values,
    };
  }

  const dataIn = parsed.data as TIn;
  const dataOut = (await (transform ? transform(dataIn) : dataIn)) as TOut;

  if (returnMode === "result") {
    return { data: dataOut, success: true };
  }

  return {
    data: dataOut,
    message: messages?.success ?? FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    success: true,
  };
}
