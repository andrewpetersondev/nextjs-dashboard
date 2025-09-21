/**
 * @file Generic server-form action handler to standardize validation, mapping, and redirect.
 */
import "server-only";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { toDenseFormErrors } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { deriveFields } from "@/shared/forms/schema-helpers";

type HandlerDeps<TFieldNames extends string, TIn, TOut> = {
  schema: z.ZodSchema<TIn>;
  transform?: (data: TIn) => TIn;
  allowedFields?: readonly TFieldNames[];
  onSuccess: (validated: TIn) => Promise<TOut | null>;
  failureMessage: string;
  unexpectedMessage: string;
  redirectTo?: string;
  logger?: (payload: Record<string, unknown>) => void;
};

export async function handleFormAction<TFieldNames extends string, TIn, TOut>(
  _prev: FormState<TFieldNames>,
  formData: FormData,
  deps: HandlerDeps<TFieldNames, TIn, TOut>,
): Promise<FormState<TFieldNames>> {
  const {
    schema,
    transform,
    allowedFields,
    onSuccess,
    failureMessage,
    unexpectedMessage,
    redirectTo,
    logger,
  } = deps;

  const fields = deriveFields<TFieldNames, TIn>(schema, allowedFields);
  const raw = Object.fromEntries(formData.entries());
  const emptyDense = toDenseFormErrors<TFieldNames>({}, fields);

  const result = await validateFormGeneric<TFieldNames, TIn>(
    formData,
    schema,
    fields,
    transform ? { transform } : undefined,
  );

  const validated = resultToFormState(result, { fields, raw });

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  try {
    const out = await onSuccess(validated.data);
    if (!out) {
      return resultToFormState(
        { error: emptyDense, success: false },
        { failureMessage, fields, raw },
      );
    }
  } catch (error) {
    logger?.({
      context: "handleFormAction",
      error,
      message: unexpectedMessage,
    });
    return resultToFormState(
      { error: emptyDense, success: false },
      { failureMessage: unexpectedMessage, fields, raw },
    );
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  return resultToFormState(result, { fields, raw });
}
