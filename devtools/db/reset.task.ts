import { schema } from "@database/schema/schema.aggregate";
import { nodeDb } from "@devtools/shared/db/node-db";
import { assertDestructiveDbTaskAllowed } from "@devtools/shared/db/prod-db.guard";
import { reset } from "drizzle-seed";

/**
 * Truncates every table in the schema. Destructive and irreversible.
 *
 * @throws When the target looks like production — `assertDestructiveDbTaskAllowed`
 * runs before anything is touched, and is the only thing standing between this
 * and live data.
 */
export async function resetDatabase(): Promise<void> {
	assertDestructiveDbTaskAllowed("db:reset");
	await reset(nodeDb, schema);
}
