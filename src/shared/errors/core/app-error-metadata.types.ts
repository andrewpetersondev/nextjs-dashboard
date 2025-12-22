/**
 * High-level DB operation context supplied at the infrastructure boundary.
 *
 * @remarks
 * This is intentionally vendor-agnostic and represents **caller-provided
 * operational context** for logging and tracing. It must never overlap with
 * intrinsic error metadata extracted from database errors.
 *
 * These fields are provided by the DAL wrapper (e.g., `executeDalResult`)
 * to add context to errors, not extracted from the error object itself.
 *
 * **Key Separation**:
 * - `DbOperationMetadata`: What the **caller** knows (operation name, entity)
 * - `DbErrorMetadata`: What the **database** reports (constraint, column)
 */
export interface DbOperationMetadata {
  readonly entity: string;
  readonly operation: string;
}

/**
 * Database metadata shared across DB adapters.
 *
 * @remarks
 * Use this for information that is common across multiple database engines.
 * Vendor-specific metadata (for example, Postgres) should extend this shape.
 *
 * This represents **intrinsic metadata extracted from the error object**,
 * not caller-provided context.
 */
export interface DbErrorMetadata {
  readonly column?: string;
  readonly constraint?: string;
  readonly table?: string;
}

/**
 * Postgres-specific metadata shape used on `AppError.metadata`.
 *
 * @remarks
 * This exists in `core/` so higher layers can narrow on `pgCode` without
 * importing a concrete Postgres adapter type.
 *
 * Represents **intrinsic fields extracted from Postgres error objects**.
 */
export interface PgErrorMetadataBase extends DbErrorMetadata {
  readonly pgCode: string;
}
