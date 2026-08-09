"use server";

import { createCustomersRepository } from "@/modules/customers/infrastructure/repository/customer.repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Total number of customers, for the dashboard summary card.
 *
 * Carries no `requireSession` of its own, unlike the create/update/delete and
 * read-by-id actions beside it. It is still unreachable unauthenticated —
 * verified 2026-08-09 — because the `src/proxy.ts` matcher covers Server Action
 * POSTs to `/dashboard/*` and redirects them, and action ids resolve only on the
 * route they are registered for. Note that the middleware is therefore the
 * *only* thing guarding this one; prefer copying a guarded sibling.
 */
export async function readTotalCustomersCountAction(): Promise<number> {
	const db = getAppDb();
	const repo = createCustomersRepository(db);
	return await repo.fetchTotalCount();
}
