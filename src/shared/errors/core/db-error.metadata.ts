/**
 * Core database fields often extracted from persistence errors.
 */
export type DbErrorMetadata = Readonly<{
  column?: string;
  constraint?: string;
  table?: string;
}>;

/**
 * Base Postgres metadata requiring a specific error code.
 */
export type PgErrorMetadataBase = DbErrorMetadata &
  Readonly<{
    pgCode: string;
  }>;

/**
 * Comprehensive Postgres error metadata.
 *
 * @remarks
 * Properties are optional as they depend on the specific Postgres error raised
 * and the database version/configuration.
 */
export type PgErrorMetadata = PgErrorMetadataBase &
  Readonly<{
    datatype?: string;
    detail?: string;
    hint?: string;
    position?: string;
    schema?: string;
    severity?: string;
    where?: string;
  }>;
