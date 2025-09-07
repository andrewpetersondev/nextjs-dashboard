import type { nodeDb } from "../cli/node-db";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof nodeDb.transaction>[0]>[0];
