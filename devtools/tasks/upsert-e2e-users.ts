import { eq } from "drizzle-orm";
import { sessions } from "@/server/db/schema/sessions";
import { users } from "@/server/db/schema/users";
import { nodeDb } from "../cli/node-db";
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

  await nodeDb.transaction(async (tx) => {
    const existing = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      const row = existing[0];
      if (!row) {
        throw new Error("Invariant: expected an existing user row");
      }
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
