// import "server-only";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as fs from "node:fs";
import path from "node:path";

// Optional: fallback to process.env.NODE_ENV === 'test' if you like
const isTestEnv = process.env.APP_ENV === "test";
console.log("isTestEnv", isTestEnv);

let url: string | undefined;

if (isTestEnv && process.env.POSTGRES_URL) {
  url = process.env.POSTGRES_URL;
} else if (process.env.POSTGRES_URL_FILE) {
  const filePath = path.resolve(process.cwd(), process.env.POSTGRES_URL_FILE);
  if (fs.existsSync(filePath)) {
    url = fs.readFileSync(filePath, "utf8").trim();
  }
}

if (!url) {
  console.error("Postgres URL could not be determined.");
  process.exit(1);
}

export const db = drizzle(url);
