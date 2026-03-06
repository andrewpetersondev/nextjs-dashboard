import { reset } from "drizzle-seed";
import { schema } from "@/server/db/schema/schema.aggregate.js";
import { nodeDb } from "./node-db.js";

console.log("reset-db.ts ...");

export async function resetDatabase(): Promise<void> {
	await reset(nodeDb, schema);
}
