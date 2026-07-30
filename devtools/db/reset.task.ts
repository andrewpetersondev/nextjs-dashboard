import { schema } from "@database/schema/schema.aggregate";
import { nodeDb } from "@devtools/shared/db/node-db";
import { assertDestructiveDbTaskAllowed } from "@devtools/shared/db/prod-db.guard";
import { reset } from "drizzle-seed";

export async function resetDatabase(): Promise<void> {
	assertDestructiveDbTaskAllowed("db:reset");
	await reset(nodeDb, schema);
}
