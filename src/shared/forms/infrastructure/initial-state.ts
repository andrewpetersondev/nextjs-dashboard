import type { z } from "zod";
import { BaseError } from "@/shared/errors/core/base-error";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/error-map.factory";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { Err } from "@/shared/result/result";

/**
 * Creates the initial failed form state with empty field errors.
 *
 * @param fieldNames - An array of field names for which the error map will be initialized.
 * @returns A failed FormResult with validation errors.
 */
export function createInitialFailedFormState<Tfieldnames extends string>(
  fieldNames: readonly Tfieldnames[],
): FormResult<never> {
  const fieldErrors: DenseFieldErrorMap<Tfieldnames, string> =
    createEmptyDenseFieldErrorMap<Tfieldnames, string>(fieldNames);

  const error = new BaseError("validation", {
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
 * @typeParam Tschema - The Zod schema describing the shape of the form.
 * @param schema - The Zod object schema used to determine the form fields.
 * @returns An initial failed form state with all fields initialized.
 * @public
 * TODO: EVALUATE BY 10/11/2025
 */
export function createInitialFailedFormStateFromSchema<
  Tschema extends z.ZodObject<z.ZodRawShape>,
>(schema: Tschema): FormResult<never> {
  type FieldNames = keyof Tschema["shape"] & string;
  const fields = Object.freeze(
    Object.keys(schema.shape),
  ) as readonly FieldNames[];
  return createInitialFailedFormState<FieldNames>(fields);
}
