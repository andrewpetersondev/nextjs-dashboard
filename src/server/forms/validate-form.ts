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
  mapFieldErrors,
  toDenseFormErrors,
} from "@/shared/forms/error-mapping";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/form-messages";
import type { DenseErrorMap, FormState } from "@/shared/forms/form-types";
import { formDataToRawMap } from "@/shared/forms/form-values";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { deriveFields } from "@/shared/forms/schema-fields";

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
  /** Optional post-parse transform. Can be async. */
  readonly transform?: (data: TIn) => TOut | Promise<TOut>;
  /** Optional explicit field list; skips derivation. */
  readonly fields?: readonly TFieldNames[];
  /** Optional explicit raw map; skips building from FormData. */
  readonly raw?: Readonly<Partial<Record<TFieldNames, unknown>>>;
  /** Optional label used in error logs. */
  readonly loggerContext?: string;
};

/** Type guard: minimally checks for a ZodError-like object. */
function isZodErrorLike(err: unknown): err is {
  name?: string;
  issues?: unknown[];
  flatten?: () => { fieldErrors: Record<string, string[]> };
} {
  return (
    typeof err === "object" &&
    err !== null &&
    ("issues" in err || "flatten" in err)
  );
}

/**
 * Resolve the canonical list of field names.
 *
 * Prefers an explicit list; otherwise derives from the schema and allowed subset.
 */
function resolveFieldList<TIn, TFieldNames extends keyof TIn & string>(
  schema: z.ZodType<TIn>,
  allowedSubset?: readonly TFieldNames[],
  explicitFields?: readonly TFieldNames[],
): readonly TFieldNames[] {
  if (explicitFields && explicitFields.length > 0) {
    return explicitFields;
  }
  return deriveFields<TFieldNames, TIn>(schema, allowedSubset);
}

/**
 * Project an arbitrary raw map to the exact allowed field set.
 *
 * Ensures deterministic shape and ignores extraneous keys.
 */
function projectRawToFields<TFieldNames extends string>(
  raw: Readonly<Partial<Record<TFieldNames, unknown>>> | undefined,
  fields: readonly TFieldNames[],
): Record<TFieldNames, unknown> {
  if (!raw) {
    return {} as Record<TFieldNames, unknown>;
  }
  const out: Partial<Record<TFieldNames, unknown>> = {};
  for (const f of fields) {
    if (Object.hasOwn(raw, f)) {
      out[f] = raw[f];
    }
  }
  return out as Record<TFieldNames, unknown>;
}

/**
 * Resolve the raw payload:
 * - If an explicit raw map is provided and non-empty, project it.
 * - Otherwise, build from FormData.
 */
function resolveRawPayload<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
  explicitRaw?: Readonly<Partial<Record<TFieldNames, unknown>>>,
): Record<TFieldNames, unknown> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    return projectRawToFields(explicitRaw, fields);
  }
  return formDataToRawMap<TFieldNames>(formData, fields);
}

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

/**
 * Convert a Zod error to dense, per-field errors aligned with known fields.
 *
 * Falls back to an empty dense map when the error shape is not Zod-like.
 */
function toDenseErrors<TFieldNames extends string>(
  schemaError: unknown,
  fields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames> {
  if (
    isZodErrorLike(schemaError) &&
    typeof schemaError.flatten === "function"
  ) {
    const flattened = schemaError.flatten();
    const normalized = mapFieldErrors(flattened.fieldErrors, fields);
    return toDenseFormErrors(normalized, fields);
  }
  return toDenseFormErrors<TFieldNames>({}, fields);
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
      error: toDenseErrors<TFieldNames>(parsed.error, fields),
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
      error: toDenseFormErrors<TFieldNames>({}, fields),
      success: false,
    };
    return resultToFormState(result, { fields, raw });
  }
}
