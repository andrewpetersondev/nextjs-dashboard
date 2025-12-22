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
