import { type ZodRawShape, z } from "zod";
import {
  buildEmptyDenseErrorMap,
  expandSparseErrorsToDense,
  pickAllowedSparseFieldErrors,
} from "@/shared/forms/errors/error-map-utils";
import type {
  DenseFieldErrorMap,
  SparseFieldErrorMap,
} from "@/shared/forms/types/field-errors.type";

/** Shape emitted by z.ZodError#flatten().fieldErrors */
export type ZodFlattenedFieldErrors = Record<
  string,
  readonly string[] | undefined
>;

/**
 * Flatten a ZodError using Zod's built-in API, normalizing optional properties.
 * Always returns arrays for formErrors and preserves fieldErrors sparsity.
 */
export function flattenZodErrorFields(error: z.ZodError): {
  fieldErrors: ZodFlattenedFieldErrors;
  formErrors: readonly string[];
} {
  const flattened = z.flattenError(error);
  return {
    fieldErrors: flattened.fieldErrors as ZodFlattenedFieldErrors,
    formErrors: flattened.formErrors ?? [],
  };
}

/**
 * Build sparse errors limited to allowed fields from a ZodError.
 * Only fields present in allowedFields may appear in the returned map.
 */
export function mapZodErrorToSparseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): SparseFieldErrorMap<TFieldNames> {
  const { fieldErrors } = flattenZodErrorFields(error);
  return pickAllowedSparseFieldErrors<TFieldNames, string>(
    fieldErrors,
    allowedFields,
  );
}

/**
 * Build dense errors aligned to allowed fields from a ZodError.
 * The returned object contains every allowed field (possibly empty arrays).
 */
export function mapZodErrorToDenseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames> {
  const sparse = mapZodErrorToSparseFieldErrors(error, allowedFields);
  return expandSparseErrorsToDense(sparse, allowedFields);
}

/**
 * Determine whether a given Zod schema is a {@link z.ZodObject}.
 *
 * @param schema - Any Zod schema instance.
 * @returns True if the schema is an object schema; otherwise, false.
 *
 * @example
 * ```ts
 * if (isZodObject(schema)) {
 *   // schema is narrowed to z.ZodObject<ZodRawShape>
 *   const keys = Object.keys(schema.shape);
 * }
 * ```
 */
export function isZodObjectSchema(
  schema: z.ZodType,
): schema is z.ZodObject<ZodRawShape> {
  return schema instanceof z.ZodObject;
}

/**
 * Type guard: checks whether the provided value is a real {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is an instance of {@link z.ZodError}; otherwise `false`.
 *
 * @remarks
 * - Use this when you know the error comes from Zod parsing within your own codebase.
 * - Narrowing with this guard gives you full type safety and access to the `ZodError` API.
 */
export function isZodErrorInstance(err: unknown): err is z.ZodError {
  return err instanceof z.ZodError;
}

/**
 * Type guard: loosely checks whether the provided value has a shape similar to {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is a non-null object with ZodError-like properties
 * (`issues` or `flatten`); otherwise `false`.
 *
 * @remarks
 * - Use this at system boundaries (e.g., logging, API layers) where the error may have been
 *   serialized, come from a different runtime, or otherwise not be a real `ZodError` instance.
 * - This guard performs a "duck typing" check: it only verifies that the object has
 *   recognizable ZodError properties, not that it is an actual `ZodError`.
 */
export function isZodErrorLikeShape(err: unknown): err is {
  name?: string;
  issues?: unknown[];
  flatten?: () => {
    fieldErrors: Record<string, readonly string[] | undefined>;
  };
} {
  if (typeof err !== "object" || err === null) {
    return false;
  }

  const anyErr = err as {
    name?: unknown;
    issues?: unknown;
    flatten?: unknown;
  };

  const nameLooksRight =
    typeof anyErr.name === "string" && anyErr.name === "ZodError";

  const issuesLooksRight = Array.isArray(anyErr.issues);

  const flattenLooksRight = typeof anyErr.flatten === "function";

  return nameLooksRight || issuesLooksRight || flattenLooksRight;
}

/**
 * Convert a Zod-like error to dense, per-field errors aligned with known fields.
 * Falls back to an empty dense map when the error shape is not Zod-like.
 */
export function mapToDenseFieldErrorsFromZod<TFieldNames extends string>(
  schemaError: unknown,
  fields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames> {
  if (
    isZodErrorLikeShape(schemaError) &&
    typeof schemaError.flatten === "function"
  ) {
    const flattened = schemaError.flatten();
    const sparse = pickAllowedSparseFieldErrors<TFieldNames, string>(
      flattened.fieldErrors,
      fields,
    );
    return expandSparseErrorsToDense(sparse, fields);
  }
  return buildEmptyDenseErrorMap(fields);
}
