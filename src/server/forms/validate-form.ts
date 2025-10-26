import "server-only";
import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/core/constants";
import { type FormResult, formError, formOk } from "@/shared/forms/core/types";
import { resolveRawFieldPayload } from "@/shared/forms/fields/field-names.resolve";
import { resolveCanonicalFieldNamesFromSchema } from "@/shared/forms/fields/zod-field-names";
import { mapZodErrorToDenseFieldErrors } from "@/shared/forms/state/mappers/zod-to-form-errors.mapper";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";
import {
  isZodErrorInstance,
  isZodErrorLikeShape,
} from "@/shared/forms/validation/utils/zod-error.helpers";

const DEFAULT_LOGGER_CONTEXT = "validateFormGeneric" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.VALIDATION_FAILED;

/**
 * Transforms an error into a FormResult with validation errors.
 * Logs failure, converts error to dense field errors, and returns form error.
 *
 * @typeParam TFieldNames - String literal union of field names.
 * @param error - The validation error to transform.
 * @param fields - Array of field names for error mapping.
 * @param loggerContext - Context string for logging.
 * @param failureMessage - Message to display for the form error.
 * @returns FormResult with validation errors.
 */
function createValidationFormError<TFieldNames extends string>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
  failureMessage: string,
): FormResult<never> {
  // Log validation failure
  const name = isZodErrorLikeShape(error) ? error.name : undefined;
  const issues =
    isZodErrorLikeShape(error) && Array.isArray(error.issues)
      ? error.issues.length
      : undefined;
  serverLogger.error({
    context: loggerContext,
    issues,
    message: failureMessage,
    name,
  });

  // Transform error to dense field errors
  const fieldErrors =
    isZodErrorInstance(error) || isZodErrorLikeShape(error)
      ? mapZodErrorToDenseFieldErrors<TFieldNames>(error as z.ZodError, fields)
      : createEmptyDenseFieldErrorMap<TFieldNames, string>(fields);

  return formError<TFieldNames>({
    fieldErrors,
    message: failureMessage,
  });
}

/**
 * Options for form validation operations.
 *
 * @typeParam TIn - Type of input object being validated.
 * @typeParam TFieldNames - String literal union of field names in TIn.
 */
interface ValidateOptions<TIn, TFieldNames extends keyof TIn & string> {
  readonly fields?: readonly TFieldNames[];
  readonly raw?: Readonly<Partial<Record<TFieldNames, unknown>>>;
  readonly loggerContext?: string;
  readonly messages?: {
    readonly successMessage?: string;
    readonly failureMessage?: string;
  };
}

/**
 * Resolves validation options with defaults.
 */
function resolveValidateOptions<TIn, TFieldNames extends keyof TIn & string>(
  options: ValidateOptions<TIn, TFieldNames>,
) {
  return {
    failureMessage: options.messages?.failureMessage ?? DEFAULT_FAILURE_MESSAGE,
    fields: options.fields,
    loggerContext: options.loggerContext ?? DEFAULT_LOGGER_CONTEXT,
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}

/**
 * Validates form data against a Zod schema.
 *
 * @typeParam TIn - Type representing expected form data structure.
 * @typeParam TFieldNames - String keys of fields within TIn to validate.
 * @param formData - FormData to validate.
 * @param schema - Zod schema for validation.
 * @param allowedFields - Optional list of specific fields to validate.
 * @param options - Additional validation options.
 * @returns Promise resolving to FormResult with validated data or errors.
 */
export async function validateFormGeneric<
  TIn,
  TFieldNames extends keyof TIn & string,
>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames> = {},
): Promise<FormResult<TIn>> {
  const {
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext,
    failureMessage,
    successMessage,
  } = resolveValidateOptions(options);

  const fields = resolveCanonicalFieldNamesFromSchema<TIn, TFieldNames>(
    schema,
    allowedFields,
    explicitFields,
  );

  const raw = resolveRawFieldPayload(formData, fields, explicitRaw);

  let parsed: Awaited<ReturnType<typeof schema.safeParseAsync>>;
  try {
    parsed = await schema.safeParseAsync(raw);
  } catch (e: unknown) {
    // Unexpected errors during validation (e.g., async refinements throwing)
    return createValidationFormError<TFieldNames>(
      e,
      fields,
      loggerContext,
      failureMessage,
    );
  }

  // Zod validation failed
  if (!parsed.success) {
    return createValidationFormError<TFieldNames>(
      parsed.error,
      fields,
      loggerContext,
      failureMessage,
    );
  }

  return formOk<TIn>(parsed.data, successMessage);
}
