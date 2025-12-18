import type { PgCode } from "@/shared/errors/adapters/postgres/pg-codes";
import type { PgErrorMetadataBase } from "@/shared/errors/core/app-error-metadata.types";

/**
 * Normalized Postgres error metadata extracted from pg error objects.
 */
export interface PgErrorMetadata extends PgErrorMetadataBase {
  readonly datatype?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly pgCode: PgCode;
  readonly position?: string;
  readonly schema?: string;
  readonly severity?: string;
  readonly where?: string;
}
