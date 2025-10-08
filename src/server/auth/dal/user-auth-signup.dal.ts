import "server-only";
import { executeDalOrThrow } from "@/server/auth/error-wrappers.throw";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Never returns null; always throws on error or invariant violation.
 *
 * @param db - Database connection
 * @param input - AuthSignupDalInput containing validated, normalized user input
 * @returns {Promise<NewUserRow>} - The freshly inserted user row
 * @throws ConflictError (if unique constraint violated)
 * @throws DatabaseError (if underlying database fails)
 * @throws Error (if invariant/row-missing)
 *
 * @remarks
 * - Always use as-only server context
 * - Only call with inputs you want to persist as issued
 */
export async function createUserForSignup(
  db: AppDatabase,
  input: AuthSignupDalInput,
): Promise<NewUserRow> {
  const { email, username, passwordHash, role } = input;

  return await executeDalOrThrow(async () => {
    const insertedRows = await db
      .insert(users)
      .values({
        email,
        password: passwordHash,
        role,
        username,
      })
      .returning();

    const userRow = insertedRows?.[0];

    if (!userRow) {
      // Invariant: A successful DB insert must return the row; log and throw explicit error
      serverLogger.error(
        {
          context: "dal.createUserForSignup",
          email,
          msg: "INSERT returned no user row; indicates DB or ORM invariant violation",
          role,
          username,
        },
        "User creation: invariant violation (no row returned)",
      );
      throw new Error(
        "Invariant violation: insert did not return a new user row. This should never happen.",
      );
    }

    return userRow;
  });
}
