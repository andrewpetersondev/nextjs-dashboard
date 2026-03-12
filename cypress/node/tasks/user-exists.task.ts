import { users } from "@database";
import { sql } from "drizzle-orm";
import { nodeDb } from "../../db/node-db";
import { firstRow } from "../../db/pg-result.utils";
import { normalizeUserEmail } from "../../shared/user-input.mapper";

/** Check if a user exists by email. */
export async function userExistsTask(email: string): Promise<boolean> {
	const normalizedEmail = normalizeUserEmail(email);

	const result = await nodeDb.execute(
		sql`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.email} = ${normalizedEmail}) AS v`,
	);

	return firstRow<{ v: boolean }>(result)?.v ?? false;
}
