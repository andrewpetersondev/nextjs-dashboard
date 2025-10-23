import type { z } from "zod";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { makeAppErrorDetails } from "@/shared/core/result/app-error/app-error";
import { Err } from "@/shared/core/result/result";
import type { FormResult } from "@/shared/forms/core/types";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";

/**
 * Creates the initial failed form state with empty field errors.
 *
 * @param fieldNames - An array of field names for which the error map will be initialized.
 * @returns A failed FormResult with validation errors.
 * @alpha
 * TODO: EVALUATE BY 10/11/2025
 */
export function createInitialFailedFormState<TFieldNames extends string>(
  fieldNames: readonly TFieldNames[],
): FormResult<never> {
  const fieldErrors: DenseFieldErrorMap<TFieldNames, string> =
    createEmptyDenseFieldErrorMap<TFieldNames, string>(fieldNames);

  const error: AppError = Object.freeze({
    __appError: "AppError" as const,
    code: "VALIDATION",
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
 * @typeParam TSchema - The Zod schema describing the shape of the form.
 * @param schema - The Zod object schema used to determine the form fields.
 * @returns An initial failed form state with all fields initialized.
 * @public
 * TODO: EVALUATE BY 10/11/2025
 */
export function createInitialFailedFormStateFromSchema<
  TSchema extends z.ZodObject<z.ZodRawShape>,
>(schema: TSchema): FormResult<never> {
  type FieldNames = keyof TSchema["shape"] & string;
  const fields = Object.freeze(
    Object.keys(schema.shape),
  ) as readonly FieldNames[];
  return createInitialFailedFormState<FieldNames>(fields);
}
