import { nodeDb } from "@cypress/node/db/node-db";
import { firstRow } from "@cypress/node/db/pg-result.utils";
import { normalizeUserEmail } from "@cypress/node/mappers/user-input.mapper";
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
