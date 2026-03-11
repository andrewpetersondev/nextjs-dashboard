import { users } from "@database";
import { nodeDb } from "@devtools/shared/db/node-db";
import { firstRow } from "@devtools/shared/db/pg-result.utils";
import { sql } from "drizzle-orm";

/** Check if a user exists by email. */
export async function userExistsTask(email: string): Promise<boolean> {
	if (!email) {
		return false;
	}

	const res = await nodeDb.execute(
		sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${email}) AS v`,
	);

	return firstRow<{ v: boolean }>(res)?.v ?? false;
}
