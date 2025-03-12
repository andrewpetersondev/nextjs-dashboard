import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.connection_string!;
console.log("connectionString", connectionString);

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString!
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});