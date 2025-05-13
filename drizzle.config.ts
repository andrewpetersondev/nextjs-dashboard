import "./envConfig";
import "dotenv/config"; // Automatically loads .env, .env.test, etc.
import { defineConfig } from "drizzle-kit";
import * as fs from "node:fs";
import path from "node:path";

// const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
// const url = fs.readFileSync(postgresUrlFile, "utf8").trim();

const isTestEnv = () => process.env.APP_ENV === "test";
console.log("isTestEnv", isTestEnv());


let url = "";

if (isTestEnv()) {
  url = process.env.POSTGRES_URL ?? "";
} else {
  const postgresUrlFile = process.env.POSTGRES_URL_FILE;
  if (postgresUrlFile) {
    const pathToFile = path.resolve(process.cwd(), postgresUrlFile);
    url = fs.readFileSync(pathToFile, "utf8").trim();
  } else {
    url = process.env.POSTGRES_URL ?? "";
  }
}

if (!url) {
  console.error("No database URL provided.");
  process.exit(1);
}

console.log("ENV", {
  APP_ENV: process.env.APP_ENV,
  POSTGRES_URL: process.env.POSTGRES_URL,
  POSTGRES_URL_FILE: process.env.POSTGRES_URL_FILE
});

console.log("DRIZZLE CONNECTING TO:", url);

export default defineConfig({
  out: "./src/db/drizzle/",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url,
  },
});
