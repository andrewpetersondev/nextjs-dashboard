import { nodeDb } from "@cypress/db/node-db";
import { firstRow } from "@cypress/db/pg-result.utils";
import { normalizeUserEmail } from "@cypress/shared/user-input.mapper";
import { users } from "@database/schema/users";
import { sql } from "drizzle-orm";

/** Check if a user exists by email. */
export async function userExistsTask(email: string): Promise<boolean> {
	const normalizedEmail = normalizeUserEmail(email);

	const result = await nodeDb.execute(
		sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${normalizedEmail}) AS v`,
	);

	return firstRow<{ v: boolean }>(result)?.v ?? false;
}
