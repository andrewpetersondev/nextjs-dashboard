import type { z } from "zod";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import {
  type DenseFieldErrorMap,
  EMPTY_FORM_ERRORS,
} from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import { extractSchemaFieldNames } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { Err } from "@/shared/results/result";

/**
 * Creates the initial form state with empty field errors.
 * This is technically a "failed" result (Err) to satisfy useActionState requirements
 * before the first submission, but with empty messages.
 */
export function makeInitialFormState<T extends string>(
  fieldNames: readonly T[],
): FormResult<never> {
  const fieldErrors: DenseFieldErrorMap<T, string> =
    makeEmptyDenseFieldErrorMap<T, string>(fieldNames);

  const error = makeAppError("validation", {
    cause: "INITIAL_STATE",
    message: "",
    metadata: Object.freeze({
      fieldErrors,
      formData: Object.freeze({}),
      formErrors: EMPTY_FORM_ERRORS,
    }),
  });

  return Err(error);
}

/**
 * Generates the initial form state based on the provided Zod object schema.
 * Extracts field names automatically from the schema shape.
 */
export function makeInitialFormStateFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): FormResult<never> {
  const fields = extractSchemaFieldNames(schema);
  return makeInitialFormState(fields);
}
