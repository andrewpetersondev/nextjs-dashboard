// biome-ignore lint/correctness/noNodejsModules: <remove rule>
import process from "node:process";
import dotenv from "dotenv";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";

dotenv.config({ path: ".env.development" });

console.log("db-dev.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
  url = process.env.POSTGRES_URL;
  console.log("Using POSTGRES_URL:", url);
} else {
  console.error("POSTGRES_URL is not set.");
  process.exit(1);
}

export const nodeDevDb: NodePgDatabase & {
  readonly $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
