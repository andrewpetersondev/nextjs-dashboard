import { users } from "@database/schema/users";
import { nodeDb } from "@devtools/shared/db/node-db";
import { firstRow } from "@devtools/shared/db/pg-result.utils";
import { normalizeUserEmail } from "@devtools/shared/user-input.mapper";
import { sql } from "drizzle-orm";

/** Check if a user exists by email. */
export async function userExistsTask(email: string): Promise<boolean> {
	const normalizedEmail = normalizeUserEmail(email);

	const res = await nodeDb.execute(
		sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${normalizedEmail}) AS v`,
	);

	return firstRow<{ v: boolean }>(res)?.v ?? false;
}
