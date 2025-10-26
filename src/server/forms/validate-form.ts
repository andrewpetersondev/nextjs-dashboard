import "server-only";
import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/core/constants";
import { type FormResult, formError, formOk } from "@/shared/forms/core/types";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types";
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
 * Logs validation failure with contextual information.
 *
 * @param context - Context string for the validation failure.
 * @param error - Error object to log.
 */
function logValidationFailure(context: string, error: unknown): void {
  const name = isZodErrorLikeShape(error) ? error.name : undefined;
  const issues =
    isZodErrorLikeShape(error) && Array.isArray(error.issues)
      ? error.issues.length
      : undefined;
  serverLogger.error({
    context,
    issues,
    message: DEFAULT_FAILURE_MESSAGE,
    name,
  });
}

/**
 * Transforms an error into dense field error map suitable for form validation errors.
 *
 * @typeParam TFieldNames - String literal union of field names.
 * @param error - The original error object from validation.
 * @param fields - Array of field names for error mapping.
 * @param loggerContext - Context string for logging.
 * @returns Dense field error map with validation messages.
 */
function toValidationFieldErrors<TFieldNames extends string>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
): DenseFieldErrorMap<TFieldNames, string> {
  logValidationFailure(loggerContext, error);

  // Use standard mapper if it's a real Zod error instance
  if (isZodErrorInstance(error)) {
    return mapZodErrorToDenseFieldErrors<TFieldNames>(error, fields);
  }

  // Fallback for serialized/duck-typed Zod errors
  if (isZodErrorLikeShape(error)) {
    const flattened = error.flatten?.();
    if (flattened?.fieldErrors) {
      return mapZodErrorToDenseFieldErrors<TFieldNames>(
        error as z.ZodError,
        fields,
      );
    }
  }

  // Non-Zod errors: return empty dense map
  return createEmptyDenseFieldErrorMap<TFieldNames, string>(fields);
}

/**
 * Helper to create form error from validation failure.
 * Consolidates error transformation and form error creation.
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
  const fieldErrors = toValidationFieldErrors<TFieldNames>(
    error,
    fields,
    loggerContext,
  );
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
    loggerContext = DEFAULT_LOGGER_CONTEXT,
    messages,
  } = options;

  const fields = resolveCanonicalFieldNamesFromSchema<TIn, TFieldNames>(
    schema,
    allowedFields,
    explicitFields,
  );

  const raw = resolveRawFieldPayload(formData, fields, explicitRaw);

  const failureMessage = messages?.failureMessage ?? DEFAULT_FAILURE_MESSAGE;
  const successMessage = messages?.successMessage ?? "";

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
