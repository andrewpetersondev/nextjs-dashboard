import { z } from "zod";
import type { PgErrorMetadata } from "@/shared/core/errors/server/adapters/postgres/db-error.dto";

const PgErrorMetadataSchema: z.ZodType<PgErrorMetadata> = z
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

/**
 * Conflict raised by a domain rule rather than a Postgres error — e.g. an
 * optimistic-concurrency precondition (`WHERE status = expected`) matching
 * zero rows. Domain code cannot honestly supply the pgCode the PG shape
 * requires, hence this second union member.
 *
 * Module-private, and grouped up here with the other private declarations:
 * `ConflictErrorMetadata` below is the exported vocabulary, and no caller
 * narrows to this arm yet (the only narrowing guard here is
 * {@link isPgMetadata}, for the other one). Export it the day one does.
 */
type DomainConflictMetadata = Readonly<{
	readonly attemptedTo?: string;
	readonly expectedFrom?: string;
	readonly policy?: string;
	readonly reason?: string;
	readonly resourceId?: string;
}>;

const DomainConflictMetadataSchema = z
	.object({
		attemptedTo: z.string().optional(),
		expectedFrom: z.string().optional(),
		policy: z.string().optional(),
		reason: z.string().optional(),
		resourceId: z.string().optional(),
	})
	.passthrough() as z.ZodType<DomainConflictMetadata>;

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

export type ConflictErrorMetadata =
	| Readonly<PgErrorMetadata>
	| DomainConflictMetadata;

export const ConflictErrorMetadataSchema = z.union([
	PgErrorMetadataSchema,
	DomainConflictMetadataSchema,
]) as z.ZodType<ConflictErrorMetadata>;

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

// Narrows to the PG shape itself: since ConflictErrorMetadata became a union
// (PG | domain conflict), narrowing to the alias would no longer guarantee
// pgCode/constraint access.
export function isPgMetadata(
	metadata: AppErrorMetadata,
): metadata is PgErrorMetadata {
	return "pgCode" in metadata;
}
