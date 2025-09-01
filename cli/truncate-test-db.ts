/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */

// I THINK THIS FILE NO LONGER SERVES ANY PURPOSE B/C PROPERLY USING DOTENV ALLOWED RESET SCRIPT TO PROPERLY TRUNCATE

import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import * as schema from "@/server/db/schema";

dotenv.config({ path: ".env.test" });

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
  url = process.env.POSTGRES_URL_TESTDB;
  console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
  console.error("POSTGRES_URL_TESTDB is not set.");
  process.exit(1);
}

const nodeEnvTestDb: NodePgDatabase & { $client: NodePgClient } = drizzle({
  casing: "snake_case",
  connection: url,
});

async function truncateAll(): Promise<void> {
  await nodeEnvTestDb.execute(sql`TRUNCATE TABLE
    ${schema.sessions},
    ${schema.invoices},
    ${schema.customers},
    ${schema.revenues},
    ${schema.demoUserCounters},
    ${schema.users}
    RESTART IDENTITY CASCADE`);
}

async function main(): Promise<void> {
  await truncateAll();
}

main()
  .then(() => {
    console.log("Test DB truncated successfully (no seeding).");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error truncating test DB:", err);
    process.exit(1);
  });
