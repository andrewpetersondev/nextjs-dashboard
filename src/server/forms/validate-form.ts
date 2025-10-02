import "server-only";
import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result";
import { ErrValidation, Ok } from "@/shared/core/result/result";
import { expandSparseErrorsToDense } from "@/shared/forms/errors/error-map-utils";
import {
  isZodErrorLikeShape,
  mapToDenseFieldErrorsFromZod,
} from "@/shared/forms/errors/zod-error-mapping";
import {
  resolveCanonicalFieldNames,
  resolveRawFieldPayload,
} from "@/shared/forms/fields/field-name-resolution";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/i18n/form-messages.const";
import { mapResultToFormState } from "@/shared/forms/mapping/result-to-form-state.mapping";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { FormState } from "@/shared/forms/types/form-state.type";

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
): Result<TOut, DenseFieldErrorMap<TFieldNames>> {
  if (isZodErrorLikeShape(error)) {
    logValidationFailure(loggerContext, error);
    return ErrValidation(
      mapToDenseFieldErrorsFromZod<TFieldNames>(error, fields),
    );
  }
  logValidationFailure(loggerContext, error);
  return ErrValidation(expandSparseErrorsToDense<TFieldNames>({}, fields));
}

/** Options for validateFormGeneric, factored for reuse and clarity. */
type ValidateOptions<TIn, TFieldNames extends keyof TIn & string> = {
  /** Optional explicit field list; skips derivation. */
  readonly fields?: readonly TFieldNames[];
  /** Optional explicit raw map; skips building from FormData. */
  readonly raw?: Readonly<Partial<Record<TFieldNames, unknown>>>;
  /** Optional label used in error logs. */
  readonly loggerContext?: string;
  /** Optional success/failure message overrides for FormState mapping. */
  readonly messages?: {
    readonly successMessage?: string;
    readonly failureMessage?: string;
  };
};

/**
 * Validate FormData with a Zod schema and return a FormState (UI boundary).
 *
 * @typeParam TIn - Parsed input shape from the schema.
 * @typeParam TFieldNames - Allowed field-name union (string keys of TIn).
 *
 * Domain: Result<TIn, DenseFieldErrorMap> is produced internally.
 * UI: mapResultToFormState performs the one-way mapping to FormState.
 */
export async function validateFormGeneric<
  TIn,
  TFieldNames extends keyof TIn & string,
>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames> = {},
): Promise<FormState<TFieldNames, TIn>> {
  const {
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext = "validateFormGeneric",
    messages,
  } = options;

  // get canonical field list (stable order to ensure deterministic error maps)
  const fields = resolveCanonicalFieldNames<TIn, TFieldNames>(
    schema,
    allowedFields,
    explicitFields,
  );

  // get raw payload limited to allowed fields
  const raw = resolveRawFieldPayload(formData, fields, explicitRaw);

  // parse and validate
  const parsed = await schema.safeParseAsync(raw);
  if (!parsed.success) {
    const failure = toFailureResult<TFieldNames, TIn>(
      parsed.error,
      fields,
      loggerContext,
    );
    return mapResultToFormState(failure, {
      failureMessage: messages?.failureMessage ?? "Validation failed",
      fields,
      raw,
      successMessage: messages?.successMessage,
    });
  }

  // success without additional transformation (handled in zod schemas)
  const result: Result<TIn, DenseFieldErrorMap<TFieldNames>> = Ok(
    parsed.data as TIn,
  );
  return mapResultToFormState(result, {
    failureMessage: messages?.failureMessage,
    fields,
    raw,
    successMessage: messages?.successMessage,
  });
}
