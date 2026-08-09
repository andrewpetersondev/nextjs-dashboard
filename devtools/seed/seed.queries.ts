import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import { customersData } from "@devtools/seed/data/seed.customers";
import type { SeedCustomerIdRow, Tx } from "@devtools/seed/data/seed.types";
import { roles } from "@devtools/seed/data/seed.users";
import {
	createSeededRandom,
	randomIntBetween,
} from "@devtools/seed/seed.random";

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
): Promise<readonly SeedCustomerIdRow[]> {
	const rows = await tx.select({ id: customers.id }).from(customers);
	if (rows.length === 0) {
		throw new Error("No customers found after seeding customers.");
	}
	return rows as readonly SeedCustomerIdRow[];
}

/** Insert demo counters for each role. */
export async function insertDemoCounters(tx: Tx): Promise<void> {
	// Seeded like the rest of the fixture data, so a reseed does not silently
	// change these counts either.
	const random = createSeededRandom(SEED_CONFIG.randomSeed);

	await tx.insert(demoUserCounters).values(
		roles.map((role) => ({
			count: randomIntBetween(
				random,
				SEED_CONFIG.demoCounterMin,
				SEED_CONFIG.demoCounterMax,
			),
			role,
		})),
	);
}
