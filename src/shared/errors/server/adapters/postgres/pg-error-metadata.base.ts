import type { DbErrorMetadata } from "@/shared/errors/core/db-error.metadata";

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
