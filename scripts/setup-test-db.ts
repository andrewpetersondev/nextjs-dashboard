/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/correctness/noNodejsModules: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */

// scripts/setup-test-db.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const execAsync = promisify(exec);

async function setupTestDatabase(): Promise<void> {
  const testDbUrl = process.env.POSTGRES_URL_TESTDB;

  // console.log("POSTGRES_URL_TESTDB:", testDbUrl); // works

  if (!testDbUrl) {
    throw new Error("POSTGRES_URL_TESTDB is required");
  }

  try {
    console.log("Setting up test database...");

    // Run migrations on test database
    await execAsync("pnpm drizzle-push-test", {
      env: { ...process.env, POSTGRES_URL: testDbUrl },
    });

    console.log("Test database setup complete");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    process.exit(1);
  }
}

if (module) {
  setupTestDatabase();
}
