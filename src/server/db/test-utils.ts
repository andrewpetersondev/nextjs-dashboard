// src/lib/db/test-utils.ts
import { Pool } from "pg";

/**
 * Test database connection pool using POSTGRES_URL_TESTDB
 */
const getTestDbPool = (): Pool => {
  const testDbUrl = process.env.POSTGRES_URL_TESTDB;

  if (!testDbUrl) {
    console.error("./src/lib/db/test-utils.ts");
    console.error(
      "POSTGRES_URL_TESTDB environment variable is required for tests",
    );
    throw new Error(
      "POSTGRES_URL_TESTDB environment variable is required for tests",
    );
  }

  return new Pool({
    connectionString: testDbUrl,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000,
    // Smaller pool for tests
    max: 5,
  });
};

/**
 * Seeds the test database with minimal required data
 */
export async function seedTestDatabase(): Promise<null> {
  const pool = getTestDbPool();

  try {
    await pool.query("BEGIN");

    // Insert any required seed data for tests
    await pool.query(`
      INSERT INTO users (id, username, email, password_hash) 
      VALUES ('test-admin-id', 'admin', 'admin@example.com', '$2b$12$test_hash')
      ON CONFLICT (email) DO NOTHING;
    `);

    await pool.query("COMMIT");
    return null;
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Cleans up test data from the database
 */
export async function cleanupTestDatabase(): Promise<null> {
  const pool = getTestDbPool();

  try {
    // Clean up test data (preserve seed data)
    await pool.query(`
      DELETE FROM users 
      WHERE email LIKE 'e2e_%@example.com' 
         OR username LIKE 'e2e_user_%';
    `);

    return null;
  } catch (error) {
    console.error("Error cleaning up test data:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
