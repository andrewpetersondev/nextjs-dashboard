/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/correctness/noNodejsModules: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */

import bcrypt from "bcryptjs";
import { Pool } from "pg";

/**
 * Test database connection pool using POSTGRES_URL_TESTDB
 */
const getTestDbPool = (): Pool => {
  const testDbUrl = process.env.POSTGRES_URL_TESTDB;

  if (!testDbUrl) {
    console.error("scripts/test-utils.ts");
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
    idleTimeoutMillis: 30_000,
    // Smaller pool for tests
    max: 5,
  });
};

// Helper to ensure a single Pool lifecycle per top-level call
const withPool = async <T>(fn: (pool: Pool) => Promise<T>): Promise<T> => {
  const pool = getTestDbPool();
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
};

/**
 * Internal: seed the test database using the provided pool
 */
async function _seedTestDatabase(
  pool: Pool,
  user?: {
    email?: string;
    username?: string;
    password?: string;
  },
): Promise<null> {
  const seedUserEmail = user?.email ?? "admin@example.com";
  const seedUsername = user?.username ?? "admin";
  const plainPassword = user?.password ?? "Password123!";

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await pool.query("BEGIN");
  try {
    // Upsert the seed or test user
    await pool.query(
      `
      INSERT INTO users (email, username, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE
        SET username = EXCLUDED.username,
            password = EXCLUDED.password
    `,
      [seedUserEmail, seedUsername, passwordHash],
    );

    await pool.query("COMMIT");
    return null;
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

/**
 * Internal: cleanup test data using the provided pool
 */
async function _cleanupTestDatabase(pool: Pool): Promise<null> {
  await pool.query(`
    DELETE FROM users 
    WHERE email LIKE 'e2e_%@example.com' 
       OR username LIKE 'e2e_user_%'
       OR email = 'admin@example.com';
  `);
  return null;
}

/**
 * Seeds the test database with minimal required data
 * If a user is provided, ensure that exact user exists with the given password.
 */
export async function seedTestDatabase(user?: {
  email?: string;
  username?: string;
  password?: string;
}): Promise<null> {
  return withPool((pool) => _seedTestDatabase(pool, user));
}

/**
 * Cleans up test data from the database
 */
export async function cleanupTestDatabase(): Promise<null> {
  return withPool((pool) => _cleanupTestDatabase(pool));
}

/**
 * Deterministic setup process: cleanup then seed
 * Accepts optional user so tests can guarantee the seeded user matches UI credentials.
 * Runs both steps against a single Pool to reduce connection churn.
 */
export async function setupTestDatabase(user?: {
  email?: string;
  username?: string;
  password?: string;
}): Promise<null> {
  return withPool(async (pool) => {
    await _cleanupTestDatabase(pool);
    await _seedTestDatabase(pool, user);
    return null;
  });
}

/**
 * Probe: check whether a user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  return withPool(async (pool) => {
    const res = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM users WHERE email = $1",
      [email],
    );
    return Number(res.rows[0]?.count ?? "0") > 0;
  });
}
