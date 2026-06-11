import "server-only";

/**
 * Identifiers associated with a DAL operation (e.g., record IDs, keys).
 */
type DalIdentifiers = Record<string, number | string>;

/**
 * Minimal DAL context describing the target entity and operation.
 */
export type DalContextLite = Readonly<{
	entity: string;
	identifiers: DalIdentifiers;
	operation: string;
}>;

/**
 * Options supplied by the DAL caller to provide high-level operational context.
 */
export type ExecuteDalCoreOptions = Readonly<{
	operationContext: string;
}>;
