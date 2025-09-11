import { reset } from "drizzle-seed";
import { schema } from "../schema";
import { nodeDb } from "./node-db";

console.log("reset-db.ts ...");

export async function resetDatabase(): Promise<void> {
  await reset(nodeDb, schema);
}
