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

export interface PgErrorMetadata extends PgErrorMetadataBase {
  readonly datatype?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly position?: string;
  readonly schema?: string;
  readonly severity?: string;
  readonly where?: string;
}
