import type { z } from "zod";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/errors/dense-error-map";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { FormResult } from "@/shared/forms/types/form-result.types";

/**
 * Creates the initial failed form state with empty field errors.
 *
 * @param fieldNames - An array of field names for which the error map will be initialized.
 * @returns An object representing a failed form state with validation errors.
 * @alpha
 * TODO: EVALUATE BY 10/11/2025
 */
export function createInitialFailedFormState<
  TFieldNames extends string,
  TMsg extends string,
  TValue = string,
>(fieldNames: readonly TFieldNames[]) {
  const fieldErrors: DenseFieldErrorMap<TFieldNames, TMsg> =
    createEmptyDenseFieldErrorMap<TFieldNames, TMsg>(fieldNames);

  return {
    error: {
      code: "VALIDATION" as const,
      fieldErrors,
      kind: "validation" as const,
      message: "",
    },
    ok: false as const,
  } satisfies Extract<
    FormResult<TFieldNames, TValue, string, TMsg>,
    { ok: false }
  >;
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
>(schema: TSchema) {
  type FieldNames = keyof TSchema["shape"] & string;
  const fields = Object.freeze(
    Object.keys(schema.shape),
  ) as readonly FieldNames[];
  return createInitialFailedFormState<FieldNames, string, string>(fields);
}
