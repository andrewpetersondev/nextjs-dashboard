import { schema } from "@database/schema/schema.aggregate";
import { eq } from "drizzle-orm";
import { nodeDb } from "../shared/db/node-db";

export async function deleteUserTask(email: string): Promise<void> {
	console.log("deleteUser", email);
	await nodeDb.delete(schema.users).where(eq(schema.users.email, email));
}
