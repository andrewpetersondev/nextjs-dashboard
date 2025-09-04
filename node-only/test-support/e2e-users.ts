import { eq, inArray, sql } from "drizzle-orm";
import { toUserId } from "@/shared/brands/mappers";
import { nodeTestDb } from "../cli/node-test-db";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";
import { hashPassword } from "../seed-support/utils";

/** Upsert an E2E user and invalidate existing sessions. */
export async function upsertE2EUser(user: {
  email: string;
  password: string;
  role?: "user" | "admin" | "guest";
}): Promise<void> {
  if (!user) {
    throw new Error("upsertE2EUser requires user object");
  }

  if (!user.email || !user.password) {
    throw new Error("upsertE2EUser requires email and password");
  }

  const normalizedEmail = user.email.trim().toLowerCase();

  const atIndex = normalizedEmail.indexOf("@");

  const baseName =
    atIndex >= 0 ? normalizedEmail.slice(0, atIndex) : normalizedEmail;

  const username = baseName.replace(/[^a-zA-Z0-9_]/g, "_");

  const role = user.role ?? "user";

  const hashed = await hashPassword(user.password);

  await nodeTestDb.transaction(async (tx) => {
    const existing = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      const row = existing[0]!;
      const userId = row.id;

      await tx
        .update(users)
        .set({ password: hashed, role, username })
        .where(eq(users.id, userId));

      await tx.delete(sessions).where(eq(sessions.userId, userId));
    } else {
      const inserted = await tx
        .insert(users)
        .values([{ email: normalizedEmail, password: hashed, role, username }])
        .returning({ id: users.id });

      if (inserted.length === 0 || !inserted[0]?.id) {
        throw new Error("Failed to insert E2E user");
      }

      const userId = inserted[0].id;
      await tx.delete(sessions).where(eq(sessions.userId, userId));
    }
  });
}

/** Check if a user exists by email. */
export async function userExists(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  const res = await nodeTestDb.execute(
    sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${email}) AS v`,
  );

  return Boolean((res as any)?.rows?.[0]?.v);
}

/** Delete E2E users and their sessions (email/username starting with e2e_). */
export async function cleanupE2EUsers(): Promise<void> {
  const usersToDelete = await nodeTestDb.execute(sql`
    SELECT id FROM ${users}
    WHERE ${users.email} LIKE 'e2e_%' OR ${users.username} LIKE 'e2e_%'
  `);

  const ids: string[] =
    (usersToDelete as any).rows?.map((r: any) => r.id).filter(Boolean) ?? [];

  if (ids.length === 0) {
    return;
  }

  const userIds = ids.map((id) => toUserId(id));

  await nodeTestDb.transaction(async (tx) => {
    await tx.delete(sessions).where(inArray(sessions.userId, userIds));
    await tx.delete(users).where(inArray(users.id, userIds));
  });
}
