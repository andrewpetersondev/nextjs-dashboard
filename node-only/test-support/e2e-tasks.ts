import { eq } from "drizzle-orm";
import { nodeTestDb } from "../cli/config-test";
import { users } from "../schema/users";

export async function deleteUser(email: string): Promise<void> {
  console.log("deleteUser", email);
  await nodeTestDb.delete(users).where(eq(users.email, email));
}
