import { reset } from "drizzle-seed";
import * as schema from "@/lib/db/schema.ts";
import { nodeEnvTestDb } from "@/lib/db/test-database.ts";

async function main(): Promise<void> {
  await reset(nodeEnvTestDb, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
  .then((): void => {
    console.log("drizzle reset complete, tables remain, but values are gone");
  })
  .catch((error) => {
    console.error("Error resetting test Db:", error);
  });
