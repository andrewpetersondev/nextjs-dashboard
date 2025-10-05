import "server-only";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { executeDalOrThrow } from "@/server/errors/error-wrappers.throw";
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
 * - Use executeDalOrThrow to ensure the db operation is executed and the result is returned.
 * - REFACTOR: this function should not return null, because null is not an expected value.
 * - REFACTOR: this function should throw a more specific error, such as "user already exists."
 */
export async function createUserForSignup(
  db: AppDatabase,
  input: AuthSignupDalInput,
): Promise<NewUserRow | null> {
  // Inputs are validated in the service layer. Inputs are normalized in the action layer with generic form validation function.
  const { email, username, passwordHash, role } = input;
  // Why should I check for null? This should never happen. If it does, it's a bug.
  // DAL should return null for some operations. Just not this one. DAL should return null if the null is an expected value. For example, checking if something exists?
  if (!email || !username || !passwordHash || !role) {
    return null;
  }

  return await executeDalOrThrow(async () => {
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
      // If the db does not return a row, then an exception was already thrown and caught by the executeDalOrThrow wrapper function.
      // This block should never run. If this does run, it indicates an invariant violation, not a normal null.
      serverLogger.error(
        { context: "dal.createUserForSignup" },
        "This block should never run. If this does run, it indicates an invariant violation, not a normal null.",
      );
      return null;
    }

    return userRow;
  });
}
