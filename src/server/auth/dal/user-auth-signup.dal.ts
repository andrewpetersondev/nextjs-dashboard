import "server-only";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { Database } from "@/server/db/connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { dalTry } from "@/server/errors/wrappers";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Inserts a new user for signup.
 * Expects pre-hashed password via AuthSignupDalInput.passwordHash.
 * @param db - Database connection
 * @param input - AuthSignupDalInput
 * @returns NewUserRow if created, otherwise null
 * @throws ConflictError (unique violation)
 * @throws DatabaseError (infra errors)
 * @remarks
 * - Use try-catch for the only purpose of throwing a more specific error (e.g. "user already exists").
 */
export async function createUserForSignup(
  db: Database,
  input: AuthSignupDalInput,
): Promise<NewUserRow | null> {
  // Minimal required-fields guard; normalize email/username here as a last line.
  const email = String(input?.email ?? "")
    .trim()
    .toLowerCase();
  const username = String(input?.username ?? "").trim();
  const passwordHash = input?.passwordHash;
  const role = input?.role;

  if (!email || !username || !passwordHash || !role) {
    return null;
  }

  return await dalTry(async () => {
    const [userRow] = await db
      .insert(users)
      .values({
        email,
        password: passwordHash,
        role,
        username,
      })
      .returning();

    if (!userRow) {
      serverLogger.error(
        { context: "dal.createUserForSignup" },
        "Insert returned no row",
      );
      return null;
    }

    return userRow;
  });
}
