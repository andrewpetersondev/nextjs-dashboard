import { invoices, type NewUserRow, users } from "@database";
import {
	buildRandomInvoiceRows,
	buildUserSeed,
} from "@devtools/seed/data/seed.builders";
import { periods } from "@devtools/seed/data/seed.periods.data";
import { ensureResetOrEmpty } from "@devtools/seed/seed.guards";
import {
	aggregateRevenues,
	fetchCustomerIds,
	insertCustomers,
	insertDemoCounters,
	insertRevenues,
} from "@devtools/seed/seed.queries";
import { nodeDb } from "@devtools/shared/db/node-db";

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
