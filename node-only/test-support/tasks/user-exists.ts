import { sql } from "drizzle-orm";
import { nodeTestDb } from "../../cli/node-test-db";
import { users } from "../../schema/users";
import { firstRow } from "../../shared/pg-utils";

/** Check if a user exists by email. */
export async function userExists(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  const res = await nodeTestDb.execute(
    sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${email}) AS v`,
  );

  return firstRow<{ v: boolean }>(res)?.v ?? false;
}
