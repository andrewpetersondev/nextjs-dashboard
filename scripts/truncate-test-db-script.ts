/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */

import { sql } from "drizzle-orm";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import * as schema from "@/server/db/schema";

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

export async function mainCypTruncate(): Promise<void> {
  await truncateAll();
}
