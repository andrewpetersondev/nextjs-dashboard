/**
 * High-level DB operation context supplied at the infrastructure boundary.
 *
 * @remarks
 * This is intentionally vendor-agnostic and should be safe to construct in
 * any database adapter.
 */
export interface DbOperationMetadata extends Record<string, unknown> {
  readonly entity?: string;
  readonly operation?: string;
  readonly table?: string;
}

/**
 * Database metadata shared across DB adapters.
 *
 * @remarks
 * Use this for information that is common across multiple database engines.
 * Vendor-specific metadata (for example, Postgres) should extend this shape.
 */
export interface DbErrorMetadata extends DbOperationMetadata {
  readonly column?: string;
  readonly constraint?: string;
}

/**
 * Postgres-specific metadata shape used on `AppError.metadata`.
 *
 * @remarks
 * This exists in `core/` so higher layers can narrow on `pgCode` without
 * importing a concrete Postgres adapter type.
 */
export interface PgErrorMetadataBase extends DbErrorMetadata {
  readonly pgCode?: string;
}

/**
 * Convenience union for callers that work with DB-related errors but do not
 * care which specific backend produced them.
 */
export type AnyDbErrorMetadata = DbErrorMetadata | PgErrorMetadataBase;
