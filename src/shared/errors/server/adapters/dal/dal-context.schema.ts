import "server-only";

/**
 * Identifiers associated with a DAL operation (e.g., record IDs, keys).
 */
type DalIdentifiers = Record<string, number | string>;

/**
 * Options supplied by the DAL caller to provide high-level operational context.
 */
export interface ExecuteDalCoreOptions {
  readonly operationContext: string;
}

/**
 * Minimal DAL context describing the target entity and operation.
 */
export interface DalContextLite {
  readonly entity: string;
  readonly identifiers: DalIdentifiers;
  readonly operation: string;
}
