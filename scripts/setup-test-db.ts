// scripts/setup-test-db.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function setupTestDatabase(): Promise<void> {
  const testDbUrl = process.env.POSTGRES_URL_TESTDB;

  if (!testDbUrl) {
    throw new Error("POSTGRES_URL_TESTDB is required");
  }

  try {
    console.log("Setting up test database...");

    // Run migrations on test database
    await execAsync("npx drizzle-kit migrate", {
      env: { ...process.env, POSTGRES_URL: testDbUrl },
    });

    console.log("Test database setup complete");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupTestDatabase();
}
