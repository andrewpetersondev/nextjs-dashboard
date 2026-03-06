import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema/users.js";
import { nodeDb } from "../cli/node-db.js";

export async function deleteUser(email: string): Promise<void> {
	console.log("deleteUser", email);
	await nodeDb.delete(users).where(eq(users.email, email));
}
