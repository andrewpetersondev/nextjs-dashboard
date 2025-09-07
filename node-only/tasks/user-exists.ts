import { sql } from "drizzle-orm";
import { nodeDb } from "../cli/node-db";
import { users } from "../schema/users";
import { firstRow } from "../seed-support/pg-utils";

/** Check if a user exists by email. */
export async function userExists(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  const res = await nodeDb.execute(
    sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${email}) AS v`,
  );

  return firstRow<{ v: boolean }>(res)?.v ?? false;
}
