/**
 * @file Zod error adapters: normalize ZodError into project error shapes.
 *
 * Responsibilities:
 * - Flatten Zod errors to fieldErrors/formErrors via Zod's API.
 * - Map flattened fieldErrors to sparse and dense shapes scoped to allowed fields.
 *
 * Keep: dense internally for determinism, sparse for UI.
 */

import { type ZodRawShape, z } from "zod";
import {
  expandSparseToDenseErrors,
  pickSparseErrorsFromAllowedFields,
} from "@/shared/forms/error-mapping";
import type { DenseErrorMap, SparseErrorMap } from "@/shared/forms/form-types";

/** Shape emitted by z.ZodError#flatten().fieldErrors */
export type ZodFieldErrors = Record<string, readonly string[] | undefined>;

/**
 * Infers and returns the provided schema.
 *
 * @param schema - The Zod schema of type T to be inferred.
 * @return The inferred schema of type T.
 */
export function inferSchema<T extends z.ZodType>(schema: T): T {
  return schema;
}

/**
 * Flatten a ZodError using Zod's built-in API, normalizing optional properties.
 * Always returns arrays for formErrors and preserves fieldErrors sparsity.
 */
export function flattenZodError(error: z.ZodError): {
  fieldErrors: ZodFieldErrors;
  formErrors: readonly string[];
} {
  const flattened = z.flattenError(error);
  return {
    fieldErrors: flattened.fieldErrors as ZodFieldErrors,
    formErrors: flattened.formErrors ?? [],
  };
}

/**
 * Build sparse errors limited to allowed fields from a ZodError.
 * Only fields present in allowedFields may appear in the returned map.
 */
export function zodToSparseErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): SparseErrorMap<TFieldNames> {
  const { fieldErrors } = flattenZodError(error);
  return pickSparseErrorsFromAllowedFields<TFieldNames, string>(
    fieldErrors,
    allowedFields,
  );
}

/**
 * Build dense errors aligned to allowed fields from a ZodError.
 * The returned object contains every allowed field (possibly empty arrays).
 */
export function zodToDenseErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames> {
  const sparse = zodToSparseErrors(error, allowedFields);
  return expandSparseToDenseErrors(sparse, allowedFields);
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
export function isZodObject(
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
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(data);
 * } catch (err) {
 *   if (isZodError(err)) {
 *     console.error("Validation failed:", err.issues);
 *   }
 * }
 * ```
 */
export function isZodError(err: unknown): err is z.ZodError {
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
 *
 * @example
 * ```ts
 * catch (err) {
 *   if (isZodErrorLike(err)) {
 *     console.error("Validation failed:", err.flatten?.().fieldErrors);
 *   }
 * }
 * ```
 */
export function isZodErrorLike(err: unknown): err is {
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
