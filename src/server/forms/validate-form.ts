import "server-only";
import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";
import { toDenseFieldErrorMapFromSparse } from "@/shared/forms/errors/dense-error-map";
import { isZodErrorLikeShape } from "@/shared/forms/errors/zod-error.helpers";
import {
  resolveCanonicalFieldNames,
  resolveRawFieldPayload,
} from "@/shared/forms/fields/field-names.resolve";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/i18n/form-messages.const";
import type { ValidationFieldErrorsError } from "@/shared/forms/mapping/result-to-form-result.mapper";
import { mapToDenseFieldErrorsFromZod } from "@/shared/forms/mapping/zod-to-field-errors.mapper";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import {
  type FormSuccess,
  formSuccess,
  validationError,
} from "@/shared/forms/types/form-state.type";

// Consolidate default messages and logger context
const DEFAULT_LOGGER_CONTEXT = "validateFormGeneric" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.VALIDATION_FAILED;

function toFailureError<TFieldNames extends string>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
): ValidationFieldErrorsError<TFieldNames> {
  logValidationFailure(loggerContext, error);
  if (isZodErrorLikeShape(error)) {
    return {
      fieldErrors: mapToDenseFieldErrorsFromZod<TFieldNames>(error, fields),
      message: DEFAULT_FAILURE_MESSAGE,
    };
  }
  return {
    fieldErrors: toDenseFieldErrorMapFromSparse<TFieldNames>({}, fields),
    message: DEFAULT_FAILURE_MESSAGE,
  };
}

/** Log validation failures with minimal, non-sensitive context. */
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
 * Convert a dense field error map into a failed validation Result.
 */
function toValidationResult<TFieldNames extends string, TOut = never>(
  errors: DenseFieldErrorMap<TFieldNames>,
): Result<TOut, ValidationFieldErrorsError<TFieldNames>> {
  return Err(
    validationError<TFieldNames, string, string>({
      fieldErrors: errors,
      message: DEFAULT_FAILURE_MESSAGE,
    }),
  );
}

/**
 * Internal helper that maps a zod failure into a domain Result with dense errors.
 */
function toFailureResult<TFieldNames extends string, TOut>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
): Result<TOut, ValidationFieldErrorsError<TFieldNames>> {
  logValidationFailure(loggerContext, error);
  if (isZodErrorLikeShape(error)) {
    return toValidationResult<TFieldNames, TOut>(
      mapToDenseFieldErrorsFromZod<TFieldNames>(error, fields),
    );
  }
  return toValidationResult<TFieldNames, TOut>(
    toDenseFieldErrorMapFromSparse<TFieldNames>({}, fields),
  );
}

/** Options for validateFormGeneric, factored for reuse and clarity. */
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
 * Validate FormData with a Zod schema and return a FormResult (UI boundary).
 *
 * @template TIn Parsed input shape from schema.
 * @template TFieldNames Allowed field-name union (string keys of TIn).
 * @param formData Raw FormData from request.
 * @param schema Zod schema defining parsing/validation.
 * @param allowedFields Optional whitelist of accepted field names.
 * @param options Additional behavior overrides (fields/raw/messages/log context).
 * @returns Promise<FormResult<TFieldNames, TIn>>
 */
export async function validateFormGeneric<
  TIn,
  TFieldNames extends keyof TIn & string,
>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames> = {},
): Promise<Result<FormSuccess<TIn>, ValidationFieldErrorsError<TFieldNames>>> {
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

  let parsed: Awaited<ReturnType<typeof schema.safeParseAsync>>;
  try {
    parsed = await schema.safeParseAsync(raw);
  } catch (e: unknown) {
    const failure = toFailureError<TFieldNames>(e, fields, loggerContext);
    return Err({
      fieldErrors: failure.fieldErrors,
      message: failureMessage,
    });
  }

  if (!parsed.success) {
    const failure = toFailureError<TFieldNames>(
      parsed.error,
      fields,
      loggerContext,
    );
    return Err({
      fieldErrors: failure.fieldErrors,
      message: failureMessage,
    });
  }

  return Ok(formSuccess(parsed.data, messages?.successMessage));
}
