import { eq } from "drizzle-orm";
import { users } from "@/server-core/db/schema/users";
import { nodeDb } from "../cli/node-db";

export async function deleteUser(email: string): Promise<void> {
  console.log("deleteUser", email);
  await nodeDb.delete(users).where(eq(users.email, email));
}
