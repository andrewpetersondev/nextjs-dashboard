import "server-only";
import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import { toDenseFieldErrorMapFromSparse } from "@/shared/forms/errors/dense-error-map";
import { isZodErrorLikeShape } from "@/shared/forms/errors/zod-error.helpers";
import {
  resolveCanonicalFieldNames,
  resolveRawFieldPayload,
} from "@/shared/forms/fields/field-names.resolve";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/i18n/form-messages.const";
import { mapToDenseFieldErrorsFromZod } from "@/shared/forms/mapping/zod-to-field-errors.mapper";
import {
  createFormErrorWithStrings,
  type FormError,
  type FormResult,
  formError,
  formOk,
} from "@/shared/forms/types/form-result.types";

// Consolidate default messages and logger context
const DEFAULT_LOGGER_CONTEXT = "validateFormGeneric" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.VALIDATION_FAILED;

/**
 * Transforms an error into a `ValidationFieldErrorsError` object suitable for handling field-level validation errors.
 *
 * @typeParam TFieldNames - The type of field names that are part of the validation error.
 * @param error - The original error object, potentially from a validation process.
 * @param fields - The array of field names for which errors are being transformed.
 * @param loggerContext - A context string to log additional diagnostic information.
 * @returns A `ValidationFieldErrorsError` containing field error mappings and a default failure message.
 */
function toValidationFailure<TFieldNames extends string>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
): FormError<TFieldNames> {
  logValidationFailure(loggerContext, error);

  if (isZodErrorLikeShape(error) && Array.isArray(error.issues)) {
    // Avoid typing to Pick<ZodError, 'issues'>; project only the data we need.
    const issues = error.issues as readonly unknown[];
    const zodLike: Pick<z.ZodError<unknown>, "issues"> = {
      // Narrow each item to the minimal shape used by mapToDenseFieldErrorsFromZod
      issues: issues as unknown as z.ZodError<unknown>["issues"],
    };
    return {
      code: "VALIDATION",
      fieldErrors: mapToDenseFieldErrorsFromZod<TFieldNames>(zodLike, fields),
      kind: "validation",
      message: DEFAULT_FAILURE_MESSAGE,
    };
  }

  return {
    code: "VALIDATION",
    fieldErrors: toDenseFieldErrorMapFromSparse<TFieldNames, string>(
      {},
      fields,
    ),
    kind: "validation",
    message: DEFAULT_FAILURE_MESSAGE,
  };
}

/**
 * Logs a validation failure with contextual information and error details.
 *
 * @param context - A string representing the context of the validation failure.
 * @param error - The error object to log, can contain details such as name and issues.
 * @returns void
 * @public
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
 * @public
 * Defines options for validation operations, specifying target fields, raw input data, logging context, and custom messages.
 *
 * @typeParam TIn - The type of the input object being validated.
 * @typeParam TFieldNames - Represents the keys of the fields in TIn to validate.
 *
 * @property fields - The specific fields to validate.
 * @property raw - Partial record containing raw input values for the provided fields.
 * @property loggerContext - Custom context string for logging purposes.
 * @property messages - Customizable success and failure messages for validation results.
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
 * Validates form data against a given schema and returns either success or validation errors.
 *
 * @typeParam TIn - The type representing the structure of the expected form data.
 * @typeParam TFieldNames - The string keys of fields within TIn to be validated.
 * @param formData - The form data to validate.
 * @param schema - The Zod schema to validate the form data against.
 * @param allowedFields - An optional list of specific fields to validate.
 * @param options - Additional options for validation behavior.
 * @returns A promise resolving to a `Result` of validated data or field-level validation errors.
 */
export async function validateFormGeneric<
  TIn,
  TFieldNames extends keyof TIn & string,
>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames> = {},
): Promise<FormResult<TFieldNames, TIn>> {
  const {
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext = DEFAULT_LOGGER_CONTEXT,
    messages,
  } = options;

  const fields = resolveCanonicalFieldNames<TIn, TFieldNames>(
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
    const failure = toValidationFailure<TFieldNames>(e, fields, loggerContext);
    return formError<TFieldNames, TIn, string, string>({
      fieldErrors: failure.fieldErrors,
      message: failureMessage,
    });
  }

  if (!parsed.success) {
    const failure = toValidationFailure<TFieldNames>(
      parsed.error,
      fields,
      loggerContext,
    );
    return createFormErrorWithStrings<TFieldNames, TIn>({
      fieldErrors: failure.fieldErrors,
      message: failureMessage,
    });
  }

  return formOk<TFieldNames, TIn>(parsed.data, successMessage);
}
