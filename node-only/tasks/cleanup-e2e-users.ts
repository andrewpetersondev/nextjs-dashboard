import { inArray, like, or, sql } from "drizzle-orm";
import { toUserId } from "../../src/shared/brands/mappers";
import { nodeDb } from "../cli/node-db";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";
import { rowsOf } from "../seed-support/pg-utils";

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
