import "dotenv/config";
import fs from "fs";
import { defineConfig } from "drizzle-kit";

// Function to read secrets from Docker secrets files
const readSecret = (path: string) => fs.readFileSync(path, 'utf8').trim();

// Read the secrets
const connectionString = readSecret('/run/secrets/postgres_url');
const host = readSecret('/run/secrets/postgres_host');
const database = readSecret('/run/secrets/postgres_db');

console.log("Postgres connectionString", connectionString);
console.log("Postgres host", host);
console.log("Postgres database", database);

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
    host: host,
    database: database,
    ssl: {
      rejectUnauthorized: true,
      cert: fs.readFileSync('/run/secrets/server.crt', 'utf8'),
      key: fs.readFileSync('/run/secrets/server.key', 'utf8'),
      ca: fs.readFileSync('/run/secrets/ca.crt', 'utf8'),
    }
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});