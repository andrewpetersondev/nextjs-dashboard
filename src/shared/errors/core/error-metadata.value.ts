import { z } from "zod";
import {
  type AppErrorKey,
  type AppErrorMetadataValueByCode,
  getAppErrorCodeMeta,
} from "@/shared/errors/catalog/app-error.registry";
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
  .passthrough() as z.ZodType<ValidationErrorMetadata>;

export type InfrastructureErrorMetadata = Readonly<{
  readonly diagnosticId?: string;
}>;

export const InfrastructureErrorMetadataSchema = z
  .object({
    diagnosticId: z.string().optional(),
  })
  .passthrough() as z.ZodType<InfrastructureErrorMetadata>;

export const PgErrorMetadataSchema = z
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
  .passthrough();

export type ConflictErrorMetadata = Readonly<PgErrorMetadata>;

export const ConflictErrorMetadataSchema =
  PgErrorMetadataSchema as z.ZodType<ConflictErrorMetadata>;

export type IntegrityErrorMetadata = Readonly<PgErrorMetadata>;

export const IntegrityErrorMetadataSchema =
  PgErrorMetadataSchema as z.ZodType<IntegrityErrorMetadata>;

export type UnknownErrorMetadata = Readonly<Record<string, unknown>>;

export const UnknownErrorMetadataSchema = z
  .object({})
  .passthrough() as z.ZodType<UnknownErrorMetadata>;

export type UnexpectedErrorMetadata = Readonly<Record<string, unknown>>;

export const UnexpectedErrorMetadataSchema = z
  .object({})
  .passthrough() as z.ZodType<UnexpectedErrorMetadata>;

export type AppErrorMetadata = AppErrorMetadataValueByCode[AppErrorKey];

export function getMetadataSchemaForCode(code: AppErrorKey): z.ZodType {
  return getAppErrorCodeMeta(code).metadataSchema;
}

export function isValidationMetadata(
  metadata: AppErrorMetadata,
): metadata is ValidationErrorMetadata {
  return "fieldErrors" in metadata || "formErrors" in metadata;
}

export function isPgMetadata(
  metadata: AppErrorMetadata,
): metadata is ConflictErrorMetadata | IntegrityErrorMetadata {
  return "pgCode" in metadata;
}
