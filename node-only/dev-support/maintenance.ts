import process from "node:process";
import { sql } from "drizzle-orm";
import { nodeDevDb } from "../cli/config-dev";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { invoices } from "../schema/invoices";
import { revenues } from "../schema/revenues";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";

/**
 * Check if all relevant tables are empty.
 */
async function isEmpty(): Promise<boolean> {
  const checks = await Promise.all([
    nodeDevDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${users} LIMIT 1) AS v`),
    nodeDevDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${customers} LIMIT 1) AS v`,
    ),
    nodeDevDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${invoices} LIMIT 1) AS v`,
    ),
    nodeDevDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${revenues} LIMIT 1) AS v`,
    ),
    nodeDevDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${demoUserCounters} LIMIT 1) AS v`,
    ),
  ]);
  return checks.every((r) => (r as any).rows?.[0]?.v === false);
}

/**
 * Truncate all tables used by seeds, restart identities, cascade.
 */
async function truncateAll(): Promise<void> {
  await nodeDevDb.execute(sql`TRUNCATE TABLE
    ${sessions},
    ${invoices},
    ${customers},
    ${revenues},
    ${demoUserCounters},
    ${users}
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
