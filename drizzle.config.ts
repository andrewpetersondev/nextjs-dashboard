import 'envConfig.ts'
import { defineConfig } from "drizzle-kit";
import fs from 'fs';

const user = process.env.POSTGRES_USER;

const postgresPortFile = process.env.POSTGRES_PORT_FILE!;
const postgresPort = fs.readFileSync(postgresPortFile, 'utf8').trim();
const portNumber = Number(postgresPort);

const postgresDbFile = process.env.POSTGRES_DB_FILE!;
const database = fs.readFileSync(postgresDbFile, 'utf8').trim();

const postgresPasswordFile = process.env.POSTGRES_PASSWORD_FILE!;
const password = fs.readFileSync(postgresPasswordFile, 'utf8').trim();

console.log("Postgres port", portNumber);
console.log("Postgres user", user);
console.log("Postgres database", database);
console.log("Postgres password", password);

if (!portNumber || !user || !database || !password) { 
  console.error("Missing required environment variables:");
  if (!portNumber) console.error("POSTGRES_PORT is not set");
  if (!user) console.error("POSTGRES_USER is not set");
  if (!database) console.error("POSTGRES_DB is not set");
  if (!password) console.error("POSTGRES_PASSWORD is not set");
  process.exit(1);
}

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  
  dbCredentials: {
    host: "postgres",
    port: portNumber,
    user: user,
    password: password,
    database: database,
    ssl: false,
  },
  migrations: {
    schema: 'public', 
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});