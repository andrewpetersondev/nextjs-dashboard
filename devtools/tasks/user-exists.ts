import { sql } from "drizzle-orm";
import { users } from "@/server/db/schema/users.js";
import { nodeDb } from "../cli/node-db.js";
import { firstRow } from "../seed-support/pg-utils.js";

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
