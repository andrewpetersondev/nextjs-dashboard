import { eq } from "drizzle-orm";
import { nodeDb } from "../cli/node-db";
import { users } from "../schema/users";

export async function deleteUser(email: string): Promise<void> {
  console.log("deleteUser", email);
  await nodeDb.delete(users).where(eq(users.email, email));
}
