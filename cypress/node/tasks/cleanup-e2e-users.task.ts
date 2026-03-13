import { nodeDb } from "@cypress/db/node-db";
import { toUserId } from "@cypress/shared/id.mapper";
import { users } from "@database";
import { inArray, like, or } from "drizzle-orm";

/** Delete E2E users (email/username starting with e2e_). */
export async function cleanupE2eUsersTask(): Promise<void> {
	const usersToDelete = await nodeDb
		.select({ id: users.id })
		.from(users)
		.where(or(like(users.email, "e2e_%"), like(users.username, "e2e_%")));

	if (usersToDelete.length === 0) {
		return;
	}

	const brandedArray = usersToDelete.map((user) => toUserId(user.id));

	await nodeDb.transaction(async (tx) => {
		await tx.delete(users).where(inArray(users.id, brandedArray));
	});
}
