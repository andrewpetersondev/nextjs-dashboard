import type { z } from "zod";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { makeAppErrorDetails } from "@/shared/core/result/app-error/app-error";
import { Err } from "@/shared/core/result/result";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/factories/error-map.factory";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/models/error-maps";
import type { FormResult } from "@/shared/forms/domain/models/form-result";

/**
 * Creates the initial failed form state with empty field errors.
 *
 * @param fieldNames - An array of field names for which the error map will be initialized.
 * @returns A failed FormResult with validation errors.
 * @alpha
 * TODO: EVALUATE BY 10/11/2025
 */
export function createInitialFailedFormState<Tfieldnames extends string>(
  fieldNames: readonly Tfieldnames[],
): FormResult<never> {
  const fieldErrors: DenseFieldErrorMap<Tfieldnames, string> =
    createEmptyDenseFieldErrorMap<Tfieldnames, string>(fieldNames);

  const error: AppError = Object.freeze({
    __appError: "AppError" as const,
    code: "validation",
    details: makeAppErrorDetails({
      fieldErrors,
    }),
    kind: "validation",
    message: "",
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
