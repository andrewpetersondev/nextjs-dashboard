import { schema } from "@database/schema/schema.aggregate";
import { inArray, like, or } from "drizzle-orm";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { nodeDb } from "../shared/db/node-db";

/** Delete E2E users and their sessions (email/username starting with e2e_). */
export async function cleanupE2eUsersTask(): Promise<void> {
	const usersToDelete = await nodeDb
		.select({ id: schema.users.id })
		.from(schema.users)
		.where(
			or(
				like(schema.users.email, "e2e_%"),
				like(schema.users.username, "e2e_%"),
			),
		);

	if (usersToDelete.length === 0) {
		return;
	}

	const brandedArray = usersToDelete.map((u) => toUserId(u.id));

	await nodeDb.transaction(async (tx) => {
		await tx.delete(schema.users).where(inArray(schema.users.id, brandedArray));
		await tx.delete(schema.users).where(inArray(schema.users.id, brandedArray));
	});
}
