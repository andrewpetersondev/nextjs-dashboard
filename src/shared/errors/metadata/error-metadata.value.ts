import { z } from "zod";
import type { PgErrorMetadata } from "@/shared/errors/server/adapters/postgres/db-error.types";

export type ValidationErrorMetadata = Readonly<{
  readonly field?: string;
  readonly fieldErrors?: Record<string, readonly string[]>;
  readonly formData?: Record<string, string>;
  readonly formErrors?: readonly string[];
  readonly policy?: string;
  readonly reason?: string;
}>;

export const ValidationErrorMetadataSchema = z
  .object({
    field: z.string().optional(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    formData: z.record(z.string(), z.string()).optional(),
    formErrors: z.array(z.string()).optional(),
    policy: z.string().optional(),
    reason: z.string().optional(),
  })
  .passthrough() as z.ZodType<ValidationErrorMetadata>;

export type InfrastructureErrorMetadata = Readonly<{
  readonly diagnosticId?: string;
  readonly policy?: string;
  readonly reason?: string;
}>;

export const InfrastructureErrorMetadataSchema = z
  .object({
    diagnosticId: z.string().optional(),
    policy: z.string().optional(),
    reason: z.string().optional(),
  })
  .passthrough() as z.ZodType<InfrastructureErrorMetadata>;

export const PgErrorMetadataSchema: z.ZodType<PgErrorMetadata> = z
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

// TODO: CONSIDER CONSOLIDATING WITH UNEXPECTEDERRORMETADATA
export type UnknownErrorMetadata = Readonly<
  Record<string, unknown> & {
    readonly policy?: string;
    readonly reason?: string;
  }
>;

export const UnknownErrorMetadataSchema = z
  .object({
    policy: z.string().optional(),
    reason: z.string().optional(),
  })
  .passthrough() as z.ZodType<UnknownErrorMetadata>;

export type UnexpectedErrorMetadata = Readonly<Record<string, unknown>>;

export const UnexpectedErrorMetadataSchema = z
  .object({})
  .passthrough() as z.ZodType<UnexpectedErrorMetadata>;

export type AppErrorMetadata =
  | ValidationErrorMetadata
  | InfrastructureErrorMetadata
  | ConflictErrorMetadata
  | IntegrityErrorMetadata
  | UnknownErrorMetadata
  | UnexpectedErrorMetadata
  | PgErrorMetadata;

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
