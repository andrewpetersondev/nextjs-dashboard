"use server";

import { createCustomersRepository } from "@/modules/customers/infrastructure/repository/customer.repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Total number of customers, for the dashboard summary card.
 *
 * Carries no session guard, unlike the create/update/delete/read-by-id actions
 * beside it. Whether that is intentional has not been established — treat the
 * asymmetry as unresolved rather than as a pattern to copy.
 */
export async function readTotalCustomersCountAction(): Promise<number> {
	const db = getAppDb();
	const repo = createCustomersRepository(db);
	return await repo.fetchTotalCount();
}
