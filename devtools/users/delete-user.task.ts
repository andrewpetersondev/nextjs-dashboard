import { users } from "@database/schema/users";
import { nodeDb } from "@devtools/shared/db/node-db";
import { normalizeUserEmail } from "@devtools/shared/user-input.mapper";
import { eq } from "drizzle-orm";

export async function deleteUserTask(email: string): Promise<void> {
	const normalizedEmail = normalizeUserEmail(email);

	await nodeDb.delete(users).where(eq(users.email, normalizedEmail));
}
