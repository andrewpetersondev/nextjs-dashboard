import "server-only";
import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";
import { expandSparseErrorsToDense } from "@/shared/forms/errors/dense-error-map";
import { isZodErrorLikeShape } from "@/shared/forms/errors/zod-error-mapping";
import {
  resolveCanonicalFieldNames,
  resolveRawFieldPayload,
} from "@/shared/forms/fields/field-name-resolution";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/i18n/form-messages.const";
import {
  mapResultToFormResult,
  type ValidationFieldErrorsError,
} from "@/shared/forms/mapping/result-to-form-result.mapping";
import { mapToDenseFieldErrorsFromZod } from "@/shared/forms/mapping/zod-errors.mappers";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { FormResult } from "@/shared/forms/types/form-state.type";

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
    message: FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    name,
  });
}

/**
 * Internal helper that maps a zod failure into a domain Result with dense errors.
 */
function toFailureResult<TFieldNames extends string, TOut>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
): Result<TOut, ValidationFieldErrorsError<TFieldNames>> {
  if (isZodErrorLikeShape(error)) {
    logValidationFailure(loggerContext, error);
    return toValidationResult<TFieldNames, TOut>(
      mapToDenseFieldErrorsFromZod<TFieldNames>(error, fields),
    );
  }
  logValidationFailure(loggerContext, error);
  return toValidationResult<TFieldNames, TOut>(
    expandSparseErrorsToDense<TFieldNames>({}, fields),
  );
}

/**
 * Convert a dense field error map into a failed validation Result.
 * @template TFieldNames Field name union.
 * @template TOut Output (never on failure path).
 * @param errors Dense field error map.
 * @returns Result<never, DenseFieldErrorMap<TFieldNames>>
 */
function toValidationResult<TFieldNames extends string, TOut = never>(
  errors: DenseFieldErrorMap<TFieldNames>,
): Result<TOut, ValidationFieldErrorsError<TFieldNames>> {
  return Err({
    fieldErrors: errors,
    message: FORM_ERROR_MESSAGES.VALIDATION_FAILED,
  });
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
): Promise<FormResult<TFieldNames, TIn>> {
  const {
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext = "validateFormGeneric",
    messages,
  } = options;

  const fields = resolveCanonicalFieldNames<TIn, TFieldNames>(
    schema,
    allowedFields,
    explicitFields,
  );

  const raw = resolveRawFieldPayload(formData, fields, explicitRaw);

  let parsed: Awaited<ReturnType<typeof schema.safeParseAsync>>;
  try {
    parsed = await schema.safeParseAsync(raw);
  } catch (e: unknown) {
    // Normalize/minimize what we log, then map to a consistent failure
    const failure = toFailureResult<TFieldNames, TIn>(e, fields, loggerContext);
    return mapResultToFormResult(failure, {
      failureMessage: messages?.failureMessage ?? "Validation failed",
      fields,
      raw,
      successMessage: messages?.successMessage,
    });
  }

  if (!parsed.success) {
    const failure = toFailureResult<TFieldNames, TIn>(
      parsed.error,
      fields,
      loggerContext,
    );
    return mapResultToFormResult(failure, {
      failureMessage: messages?.failureMessage ?? "Validation failed",
      fields,
      raw,
      successMessage: messages?.successMessage,
    });
  }

  // Success path unchanged
  const result: Result<TIn, ValidationFieldErrorsError<TFieldNames>> = Ok(
    parsed.data,
  );
  return mapResultToFormResult(result, {
    failureMessage: messages?.failureMessage,
    fields,
    raw,
    successMessage: messages?.successMessage,
  });
}
