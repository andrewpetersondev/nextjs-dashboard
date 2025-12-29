/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
import { defineConfig } from "drizzle-kit";

console.log("drizzle.config.ts ...");

// TODO: IMPORT THE ENV VARIABLES FROM ENV-TOOLING OR SHOULD I JUST ALLOW USING PROCESS FOR CLI

const url = process.env.DATABASE_URL;

console.log("DATABASE_URL:", url);

if (!url) {
  throw new Error("DATABASE_URL is not set.");
}

// Determine environment for migrations folder
const env = (
  process.env.DATABASE_ENV ??
  process.env.NODE_ENV ??
  "development"
).toLowerCase();
console.log("env:", env);

// biome-ignore lint/style/noNestedTernary: <easy to follow>
const scope = env === "test" ? "test" : env === "production" ? "prod" : "dev";
console.log("scope:", scope);

export default defineConfig({
  casing: "snake_case",
  dbCredentials: { url },
  dialect: "postgresql",
  out: `./drizzle/migrations/${scope}/`,
  schema: "./src/server/db/schema",
});
