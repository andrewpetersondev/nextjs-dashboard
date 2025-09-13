import { inArray, like, or } from "drizzle-orm";
import { users } from "@/server/db/schema/users";
import { toUserId } from "@/shared/domain/id-converters";
import { nodeDb } from "../cli/node-db";

/** Delete E2E users and their sessions (email/username starting with e2e_). */
export async function cleanupE2EUsers(): Promise<void> {
  const usersToDelete = await nodeDb
    .select({ id: users.id })
    .from(users)
    .where(or(like(users.email, "e2e_%"), like(users.username, "e2e_%")));

  if (usersToDelete.length === 0) {
    return;
  }

  const brandedArray = usersToDelete.map((u) => toUserId(u.id));

  await nodeDb.transaction(async (tx) => {
    await tx.delete(users).where(inArray(users.id, brandedArray));
    await tx.delete(users).where(inArray(users.id, brandedArray));
  });
}
