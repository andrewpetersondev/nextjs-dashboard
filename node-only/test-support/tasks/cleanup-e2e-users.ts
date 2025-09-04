import { toUserId } from "@/shared/brands/mappers";
import { inArray, sql } from "drizzle-orm";
import { nodeTestDb } from "../../cli/node-test-db";
import { sessions } from "../../schema/sessions";
import { users } from "../../schema/users";
import { rowsOf } from "../../shared/pg-utils";

/** Delete E2E users and their sessions (email/username starting with e2e_). */
export async function cleanupE2EUsers(): Promise<void> {
  const usersToDelete = await nodeTestDb.execute(sql`
    SELECT id FROM ${users}
    WHERE ${users.email} LIKE 'e2e_%' OR ${users.username} LIKE 'e2e_%'
  `);

  const ids: string[] = rowsOf<{ id: string }>(usersToDelete)
    .map((r) => r.id)
    .filter((v): v is string => true);

  if (ids.length === 0) {
    return;
  }

  const userIds = ids.map((id) => toUserId(id));

  await nodeTestDb.transaction(async (tx) => {
    await tx.delete(sessions).where(inArray(sessions.userId, userIds));
    await tx.delete(users).where(inArray(users.id, userIds));
  });
}
