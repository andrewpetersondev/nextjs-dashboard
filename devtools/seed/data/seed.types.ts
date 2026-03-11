import type { Hash, invoices, UserRole } from "@database";
import type { nodeDb } from "@devtools/shared/db/node-db";

/**
 * Transaction type derived from the db.transaction callback.
 */
export type Tx = Parameters<Parameters<typeof nodeDb.transaction>[0]>[0];

/**
 * New invoice insert type from schema.
 */
export type NewInvoice = typeof invoices.$inferInsert;

export interface SeedUserInput {
	readonly email: string;
	readonly password: string;
	readonly role: UserRole;
	readonly username: string;
}

export interface SeedUserRow {
	readonly email: string;
	readonly password: Hash;
	readonly role: UserRole;
	readonly username: string;
}

export interface SeedCustomer {
	readonly email: string;
	readonly imageUrl: string;
	readonly name: string;
}

export interface SeedCustomerIdRow {
	readonly id: string;
}
