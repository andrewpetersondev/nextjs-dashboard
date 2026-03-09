import { users } from "@database";
import { eq } from "drizzle-orm";
import { nodeDb } from "../shared/db/node-db";

export async function deleteUserTask(email: string): Promise<void> {
	console.log("deleteUser", email);
	await nodeDb.delete(users).where(eq(users.email, email));
}
