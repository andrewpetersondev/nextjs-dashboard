import type { nodeDevDb } from "../cli/config-dev";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof nodeDevDb.transaction>[0]>[0];
