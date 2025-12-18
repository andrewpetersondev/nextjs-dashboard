/**
 * High-level DB operation context supplied at the infrastructure boundary.
 *
 * @remarks
 * This is intentionally vendor-agnostic.
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
 * This is intentionally DB-vendor-agnostic. Vendor-specific metadata (e.g. Postgres)
 * should extend this shape.
 */
export interface DbErrorMetadata extends DbOperationMetadata {
  readonly column?: string;
  readonly constraint?: string;
}

/**
 * Postgres-specific metadata shape used on `AppError.metadata`.
 *
 * @remarks
 * This exists in `core/` so code can narrow on `pgCode` without importing the Postgres adapter.
 * The Postgres adapter can refine this further (e.g. `pgCode: PgCode`).
 */
export interface PgErrorMetadataBase extends DbErrorMetadata {
  readonly pgCode?: string;
}
