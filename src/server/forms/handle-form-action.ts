/**
 * @file Server action helper: validate -> execute -> map to FormState.
 *
 * Standardizes form server actions:
 * - Validates with a Zod schema.
 * - On validation failure: returns sparse field errors and echoed values.
 * - On success: executes domain logic; maps thrown errors via hooks.
 */

import "server-only";

import type { z } from "zod";
import { serverLogger } from "@/server/logging/serverLogger";
import { toDenseFormErrors } from "@/shared/forms/error-mapping";
import { formDataToRawMap } from "@/shared/forms/form-data";
import {
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
} from "@/shared/forms/form-messages";
import type { DenseFormErrors, FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { deriveFields } from "@/shared/forms/schema-helpers";
import { zodToDenseErrors } from "@/shared/forms/zod-error-adapter";
import { isZodError } from "@/shared/forms/zod-guards";

type MessageFromError = (error: unknown) => string;

type FailureArgs<TFieldNames extends string> = {
  readonly failureMessage: string;
  readonly fields: readonly TFieldNames[];
  readonly redactFields?: readonly TFieldNames[];
  readonly raw: Record<string, unknown>;
  readonly dense?: DenseFormErrors<TFieldNames>;
  readonly loggerContext?: string;
};

/**
 * Convert an error result into a FormState using dense errors and preserving raw inputs.
 * Ensures deterministic shape even when no field errors are present.
 */
function toFailureState<TFieldNames extends string, TOut>(
  args: FailureArgs<TFieldNames>,
): FormState<TFieldNames, TOut> {
  const { failureMessage, fields, redactFields, raw, dense } = args;
  const errs = dense ?? toDenseFormErrors<TFieldNames>({}, fields);
  return resultToFormState<TFieldNames, TOut>(
    { error: errs, success: false },
    { failureMessage, fields, raw, redactFields },
  );
}

/** Wrap optional transform into a Promise. */
async function maybeTransform<TIn>(
  data: TIn,
  transform?: (data: TIn) => TIn | Promise<TIn>,
): Promise<TIn> {
  if (!transform) {
    return data;
  }
  return await transform(data);
}

export type ErrorsFromError<TFieldNames extends string> = (
  error: unknown,
  fields: readonly TFieldNames[],
) => DenseFormErrors<TFieldNames>;

export type HandleFormActionOptions<
  TIn,
  TFieldNames extends keyof TIn & string,
  TOut,
> = {
  readonly schema: z.ZodType<TIn>;
  /** Optional explicit whitelist of fields; defaults to schema keys. */
  readonly fields?: readonly TFieldNames[];
  /** Optional post-parse transform hook (e.g., trim/normalize/derive). */
  readonly transform?: (data: TIn) => TIn | Promise<TIn>;
  /** Fields to redact from echoed raw values in failure state. */
  readonly redactFields?: readonly TFieldNames[];
  /** Success message on execution success. */
  readonly successMessage?: string;
  /** Generic failure message on validation/domain/infra errors. */
  readonly failureMessage?: string;
  /** Failure message when transform throws. */
  readonly transformFailureMessage?: string;
  /** Logger context for structured logs. */
  readonly loggerContext?: string;
  /** Map thrown error to a user-facing message. */
  readonly messageFromError?: MessageFromError;
  /** Map thrown error to dense field errors. */
  readonly errorsFromError?: ErrorsFromError<TFieldNames>;
};

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: centralized flow by design
export async function handleFormAction<
  TIn,
  TFieldNames extends keyof TIn & string,
  TOut = unknown,
>(
  formData: FormData,
  execute: (validated: TIn) => Promise<TOut>,
  opts: HandleFormActionOptions<TIn, TFieldNames, TOut>,
): Promise<FormState<TFieldNames, TOut>> {
  const {
    schema,
    fields: explicitFields,
    transform,
    redactFields,
    successMessage = FORM_SUCCESS_MESSAGES.SUCCESS_MESSAGE,
    failureMessage = FORM_ERROR_MESSAGES.SUBMIT_FAILED,
    transformFailureMessage = FORM_ERROR_MESSAGES.FAILED_VALIDATION,
    messageFromError,
    errorsFromError,
    loggerContext = "handleFormAction",
  } = opts;

  const fields = deriveFields<TFieldNames, TIn>(schema, explicitFields);

  // Guard against empty field list to avoid confusing behavior.
  if (fields.length === 0) {
    serverLogger.error({
      context: loggerContext,
      message: "No fields derived or provided for schema.",
    });
    return toFailureState<TFieldNames, TOut>({
      failureMessage: FORM_ERROR_MESSAGES.INVALID_FORM_DATA,
      fields,
      loggerContext,
      raw: {},
      redactFields,
    });
  }

  const raw = formDataToRawMap(formData, fields);

  // Validate
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    serverLogger.error({
      context: loggerContext,
      message: "Validation failed",
    });
    const dense = isZodError(parsed.error)
      ? zodToDenseErrors(parsed.error, fields)
      : toDenseFormErrors<TFieldNames>({}, fields);
    return toFailureState<TFieldNames, TOut>({
      dense,
      failureMessage,
      fields,
      loggerContext,
      raw,
      redactFields,
    });
  }

  // Transform
  let data: TIn;
  try {
    data = await maybeTransform(parsed.data as TIn, transform);
  } catch (e) {
    serverLogger.error({
      context: `${loggerContext}.transform`,
      errorName: e instanceof Error ? e.name : undefined,
      message: "Transform failed",
    });
    return toFailureState<TFieldNames, TOut>({
      failureMessage: transformFailureMessage,
      fields,
      loggerContext,
      raw,
      redactFields,
    });
  }

  // Execute
  try {
    const out = await execute(data);
    return { data: out, message: successMessage, success: true };
  } catch (error) {
    serverLogger.error({
      context: `${loggerContext}.execute`,
      errorName: error instanceof Error ? error.name : undefined,
      message: "Execution failed",
    });
    const dense =
      typeof errorsFromError === "function"
        ? errorsFromError(error, fields)
        : toDenseFormErrors<TFieldNames>({}, fields);
    const message =
      typeof messageFromError === "function"
        ? messageFromError(error)
        : failureMessage;
    return toFailureState<TFieldNames, TOut>({
      dense,
      failureMessage: message,
      fields,
      loggerContext,
      raw,
      redactFields,
    });
  }
}
