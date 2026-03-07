import type { invoices } from "@database/schema/invoices";
import type { UserRole } from "@database/schema/schema.constants";
import type { Hash } from "@database/schema/schema.types";
import type { nodeDb } from "../../shared/db/node-db";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof nodeDb.transaction>[0]>[0];

/**
 * New invoice insert type from schema.
 */
export type NewInvoice = typeof invoices.$inferInsert;

export interface SeedUserRow {
	readonly email: string;
	readonly password: Hash;
	readonly role: UserRole;
	readonly username: string;
}
