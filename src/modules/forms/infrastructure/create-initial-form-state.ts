import type { z } from "zod";
import { createEmptyDenseFieldErrorMap } from "@/modules/forms/domain/factories/create-error-map.factory";
import type { DenseFieldErrorMap } from "@/modules/forms/domain/types/error-maps.types";
import type { FormResult } from "@/modules/forms/domain/types/form-result.types";
import { AppError } from "@/shared/errors/core/app-error.class";
import { Err } from "@/shared/result/result";

/**
 * Creates the initial failed form state with empty field errors.
 *
 * @param fieldNames - An array of field names for which the error map will be initialized.
 * @returns A failed FormResult with validation errors.
 */
export function createInitialFailedFormState<T extends string>(
  fieldNames: readonly T[],
): FormResult<never> {
  const fieldErrors: DenseFieldErrorMap<T, string> =
    createEmptyDenseFieldErrorMap<T, string>(fieldNames);

  const error = new AppError("validation", {
    // no message shown in UI; this is just an "empty" validation state
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
export function createInitialFailedFormStateFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S): FormResult<never> {
  type FieldNames = keyof S["shape"] & string;
  const fields = Object.freeze(
    Object.keys(schema.shape),
  ) as readonly FieldNames[];
  return createInitialFailedFormState<FieldNames>(fields);
}
