import type { db } from "./config";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
