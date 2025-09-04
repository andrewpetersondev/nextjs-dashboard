import dotenv from "dotenv";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "../env-node";

dotenv.config({ path: ".env.test" });

console.log("db-test.ts ...");

let url: string;

if (DATABASE_URL) {
  url = DATABASE_URL;
  console.log("Using DATABASE_URL:", url);
} else {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

export const nodeTestDb: NodePgDatabase & {
  readonly $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
