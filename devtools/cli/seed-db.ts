import { invoices } from "@/server/db/schema/invoices.js";
import { type NewUserRow, users } from "@/server/db/schema/users.js";
import {
	buildRandomInvoiceRows,
	buildUserSeed,
} from "../seed-support/builders.js";
import {
	aggregateRevenues,
	fetchCustomerIds,
	insertCustomers,
	insertDemoCounters,
	insertRevenues,
} from "../seed-support/inserts.js";
import { ensureResetOrEmpty } from "../seed-support/maintenance.js";
import { nodeDb } from "./node-db.js";

console.log("seed-db.ts ...");

/** Main seeding function */
export async function databaseSeed(): Promise<void> {
	const proceed = await ensureResetOrEmpty();
	if (!proceed) {
		return;
	}

	const userSeed = await buildUserSeed();

	await nodeDb.transaction(async (tx) => {
		await insertRevenues(tx);
		await insertCustomers(tx);
		const existingCustomers = await fetchCustomerIds(tx);
		const invoiceRows = buildRandomInvoiceRows(existingCustomers);
		if (invoiceRows.length > 0) {
			await tx.insert(invoices).values(invoiceRows);
		}
		await insertDemoCounters(tx);
		const userValues: NewUserRow[] = userSeed.map((u) => ({
			...u,
		}));
		await tx.insert(users).values(userValues);
		await aggregateRevenues(tx);
	});
}
