// src/server/auth/infrastructure/repository/dal/get-user-by-email.dal.ts
import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { DalContext } from "@/server/auth/infrastructure/repository/types/dal-context";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
): Promise<UserRow | null> {
  const dalContext: DalContext = {
    context: "dal.users",
    identifiers: { email },
    operation: "getUserByEmail",
  };

  return await executeDalOrThrow(async () => {
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // No logging for normal "not found" case - it's expected
    return userRow ?? null;
  }, dalContext);
}
