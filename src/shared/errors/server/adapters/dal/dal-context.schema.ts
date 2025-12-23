import "server-only";

import { z } from "zod";

/**
 * Identifiers associated with a DAL operation (e.g., record IDs, keys).
 */
type DalIdentifiers = Record<string, number | string>;

/**
 * Zod schema for `DalIdentifiers`.
 *
 * @remarks
 * Uses the 2-argument `z.record(keySchema, valueSchema)` form to avoid arity
 * and inference issues and aligns the inferred type with `DalIdentifiers`.
 */
const DalIdentifiersSchema: z.ZodType<DalIdentifiers> = z.record(
  z.string(),
  z.union([z.string(), z.number()]),
);

/**
 * Zod schema to validate `DalContextLite`.
 */
const DalContextLiteSchema = z.object({
  entity: z.string().min(1),
  identifiers: DalIdentifiersSchema,
  operation: z.string().min(1),
});

/**
 * Zod schema to validate `ExecuteDalCoreOptions`.
 */
const ExecuteDalCoreOptionsSchema = z.object({
  operationContext: z.string().min(1),
});

/**
 * Validates and returns a normalized DAL context.
 *
 * @param context - The minimal DAL context to validate.
 * @returns The validated context.
 */
function validateDalContextLite(context: DalContextLite): DalContextLite {
  return DalContextLiteSchema.parse(context);
}

/**
 * Validates and returns normalized DAL options.
 *
 * @param options - Core DAL options to validate.
 * @returns The validated options.
 */
function validateExecuteDalCoreOptions(
  options: ExecuteDalCoreOptions,
): ExecuteDalCoreOptions {
  return ExecuteDalCoreOptionsSchema.parse(options);
}

/**
 * Options supplied by the DAL caller to provide high-level operational context.
 */
export interface ExecuteDalCoreOptions {
  readonly operationContext: string;
}

/**
 * Minimal DAL context describing the target entity and operation.
 */
export interface DalContextLite {
  readonly entity: string;
  readonly identifiers: DalIdentifiers;
  readonly operation: string;
}

/**
 * Builds the standard DAL error metadata shape to attach to `AppError.metadata`.
 *
 * @remarks
 * Keeps metadata keys consistent across DAL wrappers and callers that inspect DB-related failures.
 * Caller context is kept separate from intrinsic DB error metadata.
 *
 * @param context - Validated DAL context.
 * @param options - Validated DAL core options.
 * @returns Readonly metadata object for `AppError.metadata`.
 */
export function buildDalErrorMetadata(
  context: DalContextLite,
  options: ExecuteDalCoreOptions,
): Readonly<Record<string, unknown>> {
  const ctx = validateDalContextLite(context);
  const opts = validateExecuteDalCoreOptions(options);

  // Alphabetized property order (matches lint rules)
  return Object.freeze({
    entity: ctx.entity,
    identifiers: ctx.identifiers,
    operation: ctx.operation,
    operationContext: opts.operationContext,
  });
}
