/**
 * @file Server-only, generic form validation utilities.
 *
 * Validates FormData with a Zod schema and returns a typed FormState:
 * - Resolves the allowed field names for a schema.
 * - Projects FormData to a raw map limited to those fields.
 * - Produces dense, then UI-suitable errors on failure.
 * - Optionally transforms validated data.
 * - Logs failures with minimal, safe context.
 */
import "server-only";

import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result-base";
import {
  expandSparseErrorsToDense,
  toDenseFieldErrorsFromZod,
} from "@/shared/forms/error-mapping";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/form-messages";
import type { DenseErrorMap, FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import {
  resolveFieldList,
  resolveRawPayload,
} from "@/shared/forms/schema-fields";
import { isZodErrorLike } from "@/shared/forms/zod-error";

/**
 * Options for validateFormGeneric.
 *
 * @typeParam TIn - Parsed shape produced by the Zod schema.
 * @typeParam TOut - Output shape after optional transform (defaults to TIn).
 * @typeParam TFieldNames - Union of allowed field-name literals.
 */
type ValidateFormOptions<
  TIn,
  TOut = TIn,
  TFieldNames extends string = keyof TIn & string,
> = {
  /**
   * @deprecated
   *
   * Optional post-parse transform. Can be async.
   * @remarks:
   * - TODO: MOVE ALL TRANSFORMATIONS TO ZOD SCHEMAS.
   * - DO NOT USE.
   */
  readonly transform?: (data: TIn) => TOut | Promise<TOut>;
  /** Optional explicit field list; skips derivation. */
  readonly fields?: readonly TFieldNames[];
  /** Optional explicit raw map; skips building from FormData. */
  readonly raw?: Readonly<Partial<Record<TFieldNames, unknown>>>;
  /** Optional label used in error logs. */
  readonly loggerContext?: string;
};

/** Log validation failures with minimal, non-sensitive context. */
function logValidationFailure(context: string, error: unknown): void {
  const name = isZodErrorLike(error) ? error.name : undefined;
  const issues =
    isZodErrorLike(error) && Array.isArray(error.issues)
      ? error.issues.length
      : undefined;
  serverLogger.error({
    context,
    issues,
    message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    name,
  });
}

/** Normalize an optional transform to an async function. */
function normalizeTransform<TIn, TOut>(
  transform: ((data: TIn) => TOut | Promise<TOut>) | undefined,
): (data: TIn) => Promise<TOut> {
  if (!transform) {
    return async (d: TIn) => d as unknown as TOut;
  }
  return async (d: TIn) => transform(d);
}

/**
 * Validate FormData with a Zod schema and return a FormState.
 *
 * Flow:
 * 1) Resolve canonical fields.
 * 2) Resolve a raw payload limited to those fields.
 * 3) Safe-parse with Zod; on failure, return field errors via FormState.
 * 4) On success, optionally run a transform and return success FormState.
 * 5) Log failures with the provided logger context.
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
export async function validateFormGeneric<
  TIn,
  TFieldNames extends keyof TIn & string,
  TOut = TIn,
>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateFormOptions<TIn, TOut, TFieldNames> = {},
): Promise<FormState<TFieldNames, TOut>> {
  const {
    transform,
    fields: explicitFields,
    raw: explicitRaw,
    loggerContext = "validateFormGeneric",
  } = options;

  // get canonical field list
  const fields = resolveFieldList<TIn, TFieldNames>(
    schema,
    allowedFields,
    explicitFields,
  );

  // get raw payload limited to allowed fields
  const raw = resolveRawPayload(formData, fields, explicitRaw);

  // parse and validate
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    logValidationFailure(loggerContext, parsed.error);
    const result: Result<TOut, DenseErrorMap<TFieldNames>> = {
      error: toDenseFieldErrorsFromZod<TFieldNames>(parsed.error, fields),
      success: false,
    };

    return resultToFormState(result, { fields, raw });
  }

  const dataIn = parsed.data as TIn;
  const runTransform = normalizeTransform<TIn, TOut>(transform);

  try {
    const dataOut = await runTransform(dataIn);
    const result: Result<TOut, DenseErrorMap<TFieldNames>> = {
      data: dataOut,
      success: true,
    };
    return resultToFormState(result, { fields, raw });
  } catch (e) {
    serverLogger.error({
      context: `${loggerContext}.transform`,
      errorName: e instanceof Error ? e.name : undefined,
      message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    });
    const result: Result<TOut, DenseErrorMap<TFieldNames>> = {
      error: expandSparseErrorsToDense<TFieldNames>({}, fields),
      success: false,
    };
    return resultToFormState(result, { fields, raw });
  }
}
