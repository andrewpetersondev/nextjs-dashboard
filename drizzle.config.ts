import 'envConfig.ts'
import { defineConfig } from "drizzle-kit";
import fs from 'fs';

console.log("drizzle.config.ts")
console.log("process.env = ", process.env);

const postgresPasswordFile = process.env.POSTGRES_PASSWORD_FILE!;
const password = fs.readFileSync(postgresPasswordFile, 'utf8').trim();

console.log("Postgres password", password);

if (!password) {
  console.error("Missing required environment variables:");
  if (!password) console.error("POSTGRES_PASSWORD is not set");
  process.exit(1);
}

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",

  dbCredentials: {
    host: "db",
    port: 5432,
    user: "postgres",
    password: password,
    database: "postgres",
    ssl: false,
  },
  migrations: {
    schema: 'public',
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});