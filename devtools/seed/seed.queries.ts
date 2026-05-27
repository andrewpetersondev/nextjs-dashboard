import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import { customersData } from "@devtools/seed/data/seed.customers";
import type { SeedCustomerIdRow, Tx } from "@devtools/seed/data/seed.types";
import { roles } from "@devtools/seed/data/seed.users";

/** Insert demo customers. */
export async function insertCustomers(tx: Tx): Promise<void> {
	await tx.insert(customers).values(
		customersData.map((c) => ({
			email: c.email,
			imageUrl: c.imageUrl,
			name: c.name,
		})),
	);
}

/** Fetch all customer ids after insertion. */
export async function fetchCustomerIds(
	tx: Tx,
): Promise<ReadonlyArray<SeedCustomerIdRow>> {
	const rows = await tx.select({ id: customers.id }).from(customers);
	if (rows.length === 0) {
		throw new Error("No customers found after seeding customers.");
	}
	return rows as ReadonlyArray<SeedCustomerIdRow>;
}

/** Insert demo counters for each role. */
export async function insertDemoCounters(tx: Tx): Promise<void> {
	await tx.insert(demoUserCounters).values(
		roles.map((role) => ({
			count:
				Math.floor(
					Math.random() *
						(SEED_CONFIG.demoCounterMax - SEED_CONFIG.demoCounterMin + 1),
				) + SEED_CONFIG.demoCounterMin,
			role,
		})),
	);
}
