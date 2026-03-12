import { users } from "@database";
import { eq } from "drizzle-orm";
import { nodeDb } from "../../db/node-db";
import { normalizeUserEmail } from "../../shared/user-input.mapper";

export async function deleteUserTask(email: string): Promise<void> {
	const normalizedEmail = normalizeUserEmail(email);

	await nodeDb.delete(users).where(eq(users.email, normalizedEmail));
}
