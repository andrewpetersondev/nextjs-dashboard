import type { nodeTestDb } from "../cli/node-test-db";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof nodeTestDb.transaction>[0]>[0];
