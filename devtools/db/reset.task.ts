import { schema } from "@database";
import { nodeDb } from "@devtools/shared/db/node-db";
import { reset } from "drizzle-seed";

console.log("reset-db.ts ...");

export async function resetDatabase(): Promise<void> {
	await reset(nodeDb, schema);
}
