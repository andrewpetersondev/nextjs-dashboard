/** biome-ignore-all lint/style/useNamingConvention: <explanation> */
import { z } from "zod";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { PgErrorMetadata } from "@/shared/errors/core/db-error.metadata";

export type ValidationErrorMetadata = Readonly<{
  readonly fieldErrors?: Record<string, readonly string[]>;
  readonly formErrors?: readonly string[];
}>;

export const ValidationErrorMetadataSchema = z
  .object({
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    formErrors: z.array(z.string()).optional(),
  })
  .loose() as z.ZodType<ValidationErrorMetadata>;

export type InfrastructureErrorMetadata = Readonly<{
  readonly diagnosticId?: string;
}>;

export const InfrastructureErrorMetadataSchema = z
  .object({
    diagnosticId: z.string().optional(),
  })
  .loose() as z.ZodType<InfrastructureErrorMetadata>;

export type ConflictErrorMetadata = Readonly<PgErrorMetadata>;

export const ConflictErrorMetadataSchema = z
  .object({
    column: z.string().optional(),
    constraint: z.string().optional(),
    datatype: z.string().optional(),
    detail: z.string().optional(),
    hint: z.string().optional(),
    pgCode: z.string(),
    position: z.string().optional(),
    schema: z.string().optional(),
    severity: z.string().optional(),
    table: z.string().optional(),
    where: z.string().optional(),
  })
  .passthrough() as z.ZodType<ConflictErrorMetadata>;

export type IntegrityErrorMetadata = Readonly<PgErrorMetadata>;

export const IntegrityErrorMetadataSchema = z
  .object({
    column: z.string().optional(),
    constraint: z.string().optional(),
    datatype: z.string().optional(),
    detail: z.string().optional(),
    hint: z.string().optional(),
    pgCode: z.string(),
    position: z.string().optional(),
    schema: z.string().optional(),
    severity: z.string().optional(),
    table: z.string().optional(),
    where: z.string().optional(),
  })
  .passthrough() as z.ZodType<IntegrityErrorMetadata>;

export type UnknownErrorMetadata = Readonly<Record<string, unknown>>;

export const UnknownErrorMetadataSchema = z
  .object({})
  .passthrough() as z.ZodType<UnknownErrorMetadata>;

export type UnexpectedErrorMetadata = Readonly<Record<string, unknown>>;

export const UnexpectedErrorMetadataSchema = z
  .object({})
  .passthrough() as z.ZodType<UnexpectedErrorMetadata>;

export type AppErrorMetadataValueByCode = Readonly<{
  conflict: ConflictErrorMetadata;
  not_found: UnknownErrorMetadata;
  parse: UnknownErrorMetadata;
  forbidden: UnknownErrorMetadata;
  invalid_credentials: UnknownErrorMetadata;
  unauthorized: UnknownErrorMetadata;
  application_error: UnknownErrorMetadata;
  domain_error: UnknownErrorMetadata;
  presentation_error: UnknownErrorMetadata;
  database: InfrastructureErrorMetadata;
  infrastructure: InfrastructureErrorMetadata;
  integrity: IntegrityErrorMetadata;
  unexpected: UnexpectedErrorMetadata;
  unknown: UnknownErrorMetadata;
  missing_fields: ValidationErrorMetadata;
  validation: ValidationErrorMetadata;
}>;

export const AppErrorMetadataSchemaByCode = {
  application_error: UnknownErrorMetadataSchema,
  conflict: ConflictErrorMetadataSchema,
  database: InfrastructureErrorMetadataSchema,
  domain_error: UnknownErrorMetadataSchema,
  forbidden: UnknownErrorMetadataSchema,
  infrastructure: InfrastructureErrorMetadataSchema,
  integrity: IntegrityErrorMetadataSchema,
  invalid_credentials: UnknownErrorMetadataSchema,
  missing_fields: ValidationErrorMetadataSchema,
  not_found: UnknownErrorMetadataSchema,
  parse: UnknownErrorMetadataSchema,
  presentation_error: UnknownErrorMetadataSchema,
  unauthorized: UnknownErrorMetadataSchema,
  unexpected: UnexpectedErrorMetadataSchema,
  unknown: UnknownErrorMetadataSchema,
  validation: ValidationErrorMetadataSchema,
} as const satisfies Record<keyof AppErrorMetadataValueByCode, z.ZodType>;

/**
 * Get the Zod schema for a given error code's metadata.
 */
export function getMetadataSchemaForCode(code: AppErrorKey): z.ZodType {
  return AppErrorMetadataSchemaByCode[code];
}

/**
 * Union of all possible metadata types across error codes.
 */
export type AppErrorMetadata =
  AppErrorMetadataValueByCode[keyof AppErrorMetadataValueByCode];

/**
 * Type guard to check if metadata contains validation error fields.
 */
export function isValidationMetadata(
  metadata: AppErrorMetadata,
): metadata is ValidationErrorMetadata {
  return "fieldErrors" in metadata || "formErrors" in metadata;
}

/**
 * Type guard to check if metadata contains PG error fields.
 */
export function isPgMetadata(
  metadata: AppErrorMetadata,
): metadata is ConflictErrorMetadata | IntegrityErrorMetadata {
  return "pgCode" in metadata;
}
