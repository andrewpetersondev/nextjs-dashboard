import "server-only";

import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result-base";
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

/**
 * Normalize an optional transform to an async function.
 * Prefer explicit async wrapper to preserve type inference and avoid re-checks.
 */
function toAsync<TIn, TOut>(
  transform: ((data: TIn) => TOut | Promise<TOut>) | undefined,
): (data: TIn) => Promise<TOut> {
  return async (d: TIn) =>
    (transform ? transform(d) : (d as unknown as TOut)) as Awaited<TOut>;
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
    message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    name,
  });
}

/**
 * Internal helper that maps a zod failure into a FormState result with dense errors.
 */
function toFailureResult<TFieldNames extends string, TOut>(
  error: unknown,
  fields: readonly TFieldNames[],
  loggerContext: string,
): Result<TOut, DenseFieldErrorMap<TFieldNames>> {
  if (isZodErrorLikeShape(error)) {
    logValidationFailure(loggerContext, error);
    return {
      error: mapToDenseFieldErrorsFromZod<TFieldNames>(error, fields),
      success: false,
    };
  }
  logValidationFailure(loggerContext, error);
  return {
    error: expandSparseErrorsToDense<TFieldNames>({}, fields),
    success: false,
  };
}

/** Options for validateFormGeneric, factored for reuse and clarity. */
type ValidateOptions<TIn, TFieldNames extends keyof TIn & string, TOut> = {
  /** @deprecated Prefer running post-parse work in your action after calling validateFormGeneric. */
  readonly transform?: (data: TIn) => TOut | Promise<TOut>;
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
 * Validate FormData with a Zod schema and return a FormState.
 *
 * Guarantees:
 * - Dense error maps provide deterministic per-field arrays internally, then converted for UI.
 * - If transform throws, returns a failure FormState with empty per-field arrays.
 *
 * @typeParam TIn - Parsed input shape from the schema.
 * @typeParam TFieldNames - Allowed field-name union (string keys of TIn).
 * @typeParam TOut - Final output shape after transform (defaults to TIn).
 *
 * @param formData - Incoming FormData.
 * @param schema - Zod schema used for validation.
 * @param allowedFields - Optional subset of field names to accept.
 * @param options - Optional transform, fields/raw overrides, and logger context.
 *
 * @returns FormState with data on success or field errors on failure.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function validateFormGeneric<
  TIn,
  TFieldNames extends keyof TIn & string,
  TOut = TIn,
>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames, TOut> = {},
): Promise<FormState<TFieldNames, TOut>> {
  const {
    transform,
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
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const failure = toFailureResult<TFieldNames, TOut>(
      parsed.error,
      fields,
      loggerContext,
    );
    return mapResultToFormState(failure, {
      failureMessage: messages?.failureMessage,
      fields,
      raw,
      successMessage: messages?.successMessage,
    });
  }

  // optionally transform
  const runTransform = toAsync<TIn, TOut>(transform);
  try {
    const dataOut = await runTransform(parsed.data as TIn);
    const result: Result<TOut, DenseFieldErrorMap<TFieldNames>> = {
      data: dataOut,
      success: true,
    };
    return mapResultToFormState(result, {
      failureMessage: messages?.failureMessage,
      fields,
      raw,
      successMessage: messages?.successMessage,
    });
  } catch (err) {
    serverLogger.error({
      context: `${loggerContext}.transform`,
      errorName: err instanceof Error ? err.name : undefined,
      message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    });
    const failure = toFailureResult<TFieldNames, TOut>(
      err,
      fields,
      `${loggerContext}.transform`,
    );
    return mapResultToFormState(failure, {
      failureMessage: messages?.failureMessage,
      fields,
      raw,
      successMessage: messages?.successMessage,
    });
  }
}

/**
 * Convenience wrapper when no transform/output change is needed.
 * Keeps call-sites succinct while preserving types.
 */
export async function validateForm<TIn, TFieldNames extends keyof TIn & string>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: Omit<ValidateOptions<TIn, TFieldNames, TIn>, "transform"> = {},
): Promise<FormState<TFieldNames, TIn>> {
  return await validateFormGeneric<TIn, TFieldNames, TIn>(
    formData,
    schema,
    allowedFields,
    options,
  );
}
