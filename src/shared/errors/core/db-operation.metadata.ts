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
