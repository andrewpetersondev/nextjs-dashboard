// this file should be server-only, but then I can not test or seed
// import "server-only"; // uncomment for production

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

let url: string;

if (process.env.POSTGRES_URL) {
  url = process.env.POSTGRES_URL;
  console.log("database.ts ...");
  console.log("DRIZZLE CONNECTING TO:", url);
} else {
  console.error("POSTGRES_URL is not set.");
  process.exit(1);
}

export const db = drizzle(url);
