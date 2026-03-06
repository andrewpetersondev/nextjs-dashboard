import { schema } from "@database/schema/schema.aggregate.js";
import { reset } from "drizzle-seed";
import { nodeDb } from "./node-db.js";

console.log("reset-db.ts ...");

export async function resetDatabase(): Promise<void> {
	await reset(nodeDb, schema);
}
