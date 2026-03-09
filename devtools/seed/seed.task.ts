import { schema } from "@database/schema/schema.aggregate";
import type { NewUserRow } from "@database/schema/users";
import { nodeDb } from "../shared/db/node-db";
import { buildRandomInvoiceRows, buildUserSeed } from "./data/seed.builders";
import { periods } from "./data/seed.periods.data";
import { ensureResetOrEmpty } from "./seed.guards";
import {
	aggregateRevenues,
	fetchCustomerIds,
	insertCustomers,
	insertDemoCounters,
	insertRevenues,
} from "./seed.queries";

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
		const invoiceRows = buildRandomInvoiceRows(existingCustomers, periods);
		if (invoiceRows.length > 0) {
			await tx.insert(schema.invoices).values(invoiceRows);
		}
		await insertDemoCounters(tx);
		const userValues: NewUserRow[] = userSeed.map((u) => ({
			...u,
		}));
		await tx.insert(schema.users).values(userValues);
		await aggregateRevenues(tx);
	});
}
