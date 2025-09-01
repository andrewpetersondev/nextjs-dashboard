// biome-ignore lint/correctness/noNodejsModules: <remove rule>
import process from "node:process";
import { sql } from "drizzle-orm";
import * as schema from "../../src/server/db/schema/schema";
import { db } from "./config";

/**
 * Check if all relevant tables are empty.
 */
export async function isEmpty(): Promise<boolean> {
  const checks = await Promise.all([
    db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.users} LIMIT 1) AS v`),
    db.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.customers} LIMIT 1) AS v`,
    ),
    db.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.invoices} LIMIT 1) AS v`,
    ),
    db.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.revenues} LIMIT 1) AS v`,
    ),
    db.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.demoUserCounters} LIMIT 1) AS v`,
    ),
  ]);
  return checks.every((r) => (r as any).rows?.[0]?.v === false);
}

/**
 * Truncate all tables used by seeds, restart identities, cascade.
 */
export async function truncateAll(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE
    ${schema.sessions},
    ${schema.invoices},
    ${schema.customers},
    ${schema.revenues},
    ${schema.demoUserCounters},
    ${schema.users}
    RESTART IDENTITY CASCADE`);
}

/**
 * Ensures DB is empty or resets it if SEED_RESET=true.
 * Returns true if it is safe to proceed with seeding.
 */
export async function ensureResetOrEmpty(): Promise<boolean> {
  const shouldReset = process.env.SEED_RESET === "true";
  if (shouldReset) {
    await truncateAll();
    return true;
  }
  const empty = await isEmpty();
  if (!empty) {
    // eslint-disable-next-line no-console
    console.error(
      "Database is not empty. Set SEED_RESET=true to force reseed. Exiting...",
    );
    return false;
  }
  return true;
}
