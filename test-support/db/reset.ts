import { reset } from "drizzle-seed";
import * as schema from "../../src/server/db/schema/schema";
import { db } from "./config";

export async function resetCypressDb(): Promise<void> {
  await reset(db, schema);
}
