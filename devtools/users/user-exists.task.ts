import { schema } from "@database/schema/schema.aggregate";
import { sql } from "drizzle-orm";
import { nodeDb } from "../shared/db/node-db";
import { firstRow } from "../shared/db/pg-result.utils";

/** Check if a user exists by email. */
export async function userExistsTask(email: string): Promise<boolean> {
	if (!email) {
		return false;
	}

	const res = await nodeDb.execute(
		sql`SELECT EXISTS(SELECT 1 FROM ${schema.users} WHERE ${schema.users.email} = ${email}) AS v`,
	);

	return firstRow<{ v: boolean }>(res)?.v ?? false;
}
