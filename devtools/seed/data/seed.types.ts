import type { nodeDb } from "../../shared/db/node-db";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof nodeDb.transaction>[0]>[0];
