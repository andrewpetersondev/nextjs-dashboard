import type { z } from "zod";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import { Err } from "@/shared/result/result";

/**
 * Creates the initial failed form state with empty field errors.
 *
 * @param fieldNames - An array of field names for which the error map will be initialized.
 * @returns A failed FormResult with validation errors.
 */
export function makeInitialFailedFormState<T extends string>(
  fieldNames: readonly T[],
): FormResult<never> {
  const fieldErrors: DenseFieldErrorMap<T, string> =
    makeEmptyDenseFieldErrorMap<T, string>(fieldNames);

  const error = makeAppError("validation", {
    cause: "",
    message: "",
    metadata: {
      fieldErrors,
    },
  });

  return Err(error);
}

/**
 * Generates the initial failed form state based on the provided Zod object schema.
 *
 * @typeParam S - The Zod schema describing the shape of the form.
 * @param schema - The Zod object schema used to determine the form fields.
 * @returns An initial failed form state with all fields initialized.
 */
export function makeInitialFailedFormStateFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): FormResult<never> {
  type FieldNames = keyof S["shape"] & string;
  const fields = Object.freeze(
    Object.keys(schema.shape),
  ) as readonly FieldNames[];
  return makeInitialFailedFormState<FieldNames>(fields);
}
