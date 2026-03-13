import { schema } from "@database/schema/schema.aggregate";
import { nodeDb } from "@devtools/shared/db/node-db";
import { reset } from "drizzle-seed";

export async function resetDatabase(): Promise<void> {
	await reset(nodeDb, schema);
}
