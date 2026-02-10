import type { ZodObject, ZodRawShape } from "zod";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { EMPTY_FORM_ERRORS } from "@/shared/forms/core/constants";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.factory";
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
  S extends ZodObject<ZodRawShape>,
>(schema: S): FormResult<never> {
  const fields = toSchemaKeys(schema);
  return makeInitialFormState(fields);
}
