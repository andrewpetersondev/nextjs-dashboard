// biome-ignore lint/correctness/noNodejsModules: <remove rule>
import process from "node:process";
import dotenv from "dotenv";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";

dotenv.config({ path: ".env.test" });

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
  url = process.env.POSTGRES_URL_TESTDB;
  console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
  console.error("POSTGRES_URL_TESTDB is not set.");
  process.exit(1);
}

export const db: NodePgDatabase & { readonly $client: NodePgClient } = drizzle({
  casing: "snake_case",
  connection: url,
});
