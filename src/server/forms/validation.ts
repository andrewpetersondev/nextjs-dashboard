import "server-only";

import type { z } from "zod";
import { logger } from "@/server/logging/logger";
import { isZodObject } from "@/shared/forms/guards";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/messages";
import type { FieldErrors, FormState } from "@/shared/forms/types";
import {
  deriveAllowedFieldsFromSchema,
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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
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
      ? (deriveAllowedFieldsFromSchema(schema) as readonly TFieldNames[])
      : ([] as const));

  let finalResult: FormState<TFieldNames, TOut> | Result<TOut, FieldErrors>;

  // biome-ignore lint/style/noNegationElse: <temp>
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const normalized = mapFieldErrors(fieldErrors, fields);

    if (returnMode === "result") {
      const denseErrors = normalizeFieldErrors(
        normalized as Record<string, string[] | undefined>,
      );
      finalResult = { error: denseErrors, success: false };
    } else {
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

      finalResult = {
        errors: normalized,
        message: messages?.failure ?? FORM_ERROR_MESSAGES.FAILED_VALIDATION,
        success: false,
        values,
      };
    }
  } else {
    const dataIn = parsed.data as TIn;
    const dataOut = (await (transform ? transform(dataIn) : dataIn)) as TOut;

    if (returnMode === "result") {
      finalResult = { data: dataOut, success: true };
    } else {
      finalResult = {
        data: dataOut,
        message: messages?.success ?? FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
        success: true,
      };
    }
  }

  return finalResult;
}
