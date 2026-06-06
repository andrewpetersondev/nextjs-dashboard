import { nodeDb } from "@cypress/node/db/node-db";
import { normalizeUserEmail } from "@cypress/node/mappers/user-input.mapper";
import { users } from "@database/schema/users";
import { eq } from "drizzle-orm";

export async function deleteUserTask(email: string): Promise<void> {
	const normalizedEmail = normalizeUserEmail(email);

	await nodeDb.delete(users).where(eq(users.email, normalizedEmail));
}
