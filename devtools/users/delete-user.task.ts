import { users } from "@database";
import { nodeDb } from "@devtools/shared/db/node-db";
import { eq } from "drizzle-orm";

export async function deleteUserTask(email: string): Promise<void> {
	console.log("deleteUser", email);
	await nodeDb.delete(users).where(eq(users.email, email));
}
