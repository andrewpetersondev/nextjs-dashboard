import './envConfig'
import { defineConfig } from "drizzle-kit";
import fs from 'fs';

const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
const url = fs.readFileSync(postgresUrlFile, 'utf8').trim();

export default defineConfig({
  out: "./src/db/drizzle/",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url
  }
})