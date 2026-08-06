import { invoices } from "@database/schema/invoices";
import { type NewUserRow, users } from "@database/schema/users";
import {
	buildRandomInvoiceRows,
	buildUserSeed,
} from "@devtools/seed/data/seed.builders";
import { periods } from "@devtools/seed/data/seed.periods.data";
import { assertDatabaseEmpty } from "@devtools/seed/seed.guards";
import {
	fetchCustomerIds,
	insertCustomers,
	insertDemoCounters,
} from "@devtools/seed/seed.queries";
import { nodeDb } from "@devtools/shared/db/node-db";
import { assertDestructiveDbTaskAllowed } from "@devtools/shared/db/prod-db.guard";

/** Main seeding function */
export async function databaseSeed(): Promise<void> {
	assertDestructiveDbTaskAllowed("db:seed");
	await assertDatabaseEmpty();

	const userSeed = await buildUserSeed();

	await nodeDb.transaction(async (tx) => {
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
	});
}
