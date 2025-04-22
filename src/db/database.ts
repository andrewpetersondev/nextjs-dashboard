import "server-only";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "fs";

const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
const url = fs.readFileSync(postgresUrlFile, "utf8").trim();

if (!url) {
  console.error("Missing required POSTGRES_URL environment variable:");
  process.exit(1);
}

export const db = drizzle(url);
