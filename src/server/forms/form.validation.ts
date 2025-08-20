import "server-only";

import * as z from "zod";
import type { Result } from "@/core/result.base";
import { FORM_VALIDATION_ERROR_MESSAGES } from "@/errors/error-messages";
import { FORM_VALIDATION_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { logger } from "@/server/logging/logger";
import type { FormErrors, FormState } from "@/shared/forms/form.types";

// Strongly typed guard for ZodObject (avoids `any` casts)
function isZodObject(
  schema: z.ZodTypeAny,
): schema is z.ZodObject<z.ZodRawShape> {
  return schema instanceof z.ZodObject;
}

// Helper: derive allowed field names from a Zod object schema
function deriveAllowedFieldsFromSchema<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
): ReadonlyArray<Extract<keyof z.infer<S>, string>> {
  type Keys = Extract<keyof z.infer<S>, string>;
  const keys = Object.keys(schema.shape) as Keys[];
  return keys as ReadonlyArray<Keys>;
}

/**
 * Maps Zod field errors to a domain-specific error map.
 *
 * @template TFieldNames - String literal union of valid field names.
 * @param fieldErrors - Zod field errors object.
 * @param allowedFields - Array of allowed field names.
 */
function mapFieldErrors<TFieldNames extends string>(
  fieldErrors: Record<string, string[] | undefined>,
  allowedFields: readonly TFieldNames[],
): FormErrors<TFieldNames> {
  const errors: FormErrors<TFieldNames> = {};
  for (const key of allowedFields) {
    if (fieldErrors[key]) {
      errors[key] = fieldErrors[key];
    }
  }
  return errors;
}

/**
 * Normalizes Zod fieldErrors to a consistent Record<string, string[]> shape.
 */
export function normalizeFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key in fieldErrors) {
    if (Object.hasOwn(fieldErrors, key)) {
      result[key] = fieldErrors[key] ?? [];
    }
  }
  return result;
}

// --- Generic validate + transform with selectable return shape ---

/**
 * Options for form validation configuration.
 *
 * Allows transforming parsed data, customizing return mode, managing success/failure
 * messages, and redacting sensitive fields.
 *
 * @typeParam TFieldNames - Names of the form fields to redact.
 * @typeParam TIn - Input type of the form data.
 * @typeParam TOut - Output type of the transformed data (defaults to TIn).
 *
 * @property transform - Optional transformer applied to successfully parsed data. Can return a value synchronously or as a Promise.
 * @property returnMode - Defines the return structure: `"form"` for form-like values (default) or `"result"` for a Result-based response.
 * @property messages - Customizable success and failure messages when using `form` return mode.
 * @property redactFields - List of field names to exclude from the output (e.g., sensitive data like passwords).
 *
 * @example
 * ```typescript
 * const options: ValidateFormOptions<'password', { username: string; password: string }, { username: string }> = {
 *   transform: (data) => ({ username: data.username }),
 *   returnMode: "result",
 *   messages: { success: "Validation passed", failure: "Validation failed" },
 *   redactFields: ['password'],
 * };
 * ```
 */
export type ValidateFormOptions<TFieldNames extends string, TIn, TOut = TIn> = {
  // Optional transformer applied only on successful parse
  transform?: (data: TIn) => TOut | Promise<TOut>;
  // Choose return shape: form (default) or result
  returnMode?: "form" | "result";
  // Override success/failure messages for form mode
  messages?: {
    success?: string;
    failure?: string;
  };
  // Do not echo these fields back in values (e.g., passwords)
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
): Promise<
  FormState<TFieldNames, TOut> | Result<TOut, Record<string, string[]>>
> {
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
      if (redactFields.includes(key)) continue;
      const v = raw[key as string];
      if (typeof v === "string") values[key] = v;
    }

    logger.error({
      context: "validateFormGeneric",
      error: parsed.error,
      message:
        messages?.failure ?? FORM_VALIDATION_ERROR_MESSAGES.FAILED_VALIDATION,
    });

    return {
      errors: normalized,
      message:
        messages?.failure ?? FORM_VALIDATION_ERROR_MESSAGES.FAILED_VALIDATION,
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
    message:
      messages?.success ?? FORM_VALIDATION_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    success: true,
  };
}
