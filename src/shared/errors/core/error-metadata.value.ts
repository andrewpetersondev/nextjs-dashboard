/**
 * Base shape for metadata dictionaries.
 */
type ErrorMetadataShape = Record<string, unknown>;

/**
 * Generic error metadata container.
 *
 * @remarks
 * Prefer narrow, integration-specific metadata types (for example from
 * `db-error.metadata.ts`) at the boundaries, but this remains the
 * canonical, transport-agnostic bag of additional details.
 *
 * Common metadata patterns by layer:
 * - Database/Infrastructure: `pgCode`, `constraint`, `table`, `operation`
 * - Validation/Forms: `fieldErrors`, `formErrors`, `values`
 * - All layers: `diagnosticId`, `operation`, `identifiers`
 */
export type ErrorMetadataValue<
  T extends ErrorMetadataShape = ErrorMetadataShape,
> = Readonly<T>;
