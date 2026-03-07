import { schema } from "@database/schema/schema.aggregate";
import { reset } from "drizzle-seed";
import { nodeDb } from "../shared/db/node-db";

console.log("reset-db.ts ...");

export async function resetDatabase(): Promise<void> {
	await reset(nodeDb, schema);
}
