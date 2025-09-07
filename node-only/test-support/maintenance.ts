import { sql } from "drizzle-orm";
import { nodeTestDb } from "../cli/node-test-db";
import { SEED_RESET } from "../config/env-node";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { invoices } from "../schema/invoices";
import { revenues } from "../schema/revenues";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";
import { firstRow } from "../seed-support/pg-utils";

/**
 * Check if all relevant tables are empty.
 */
async function isEmpty(): Promise<boolean> {
  const checks = await Promise.all([
    nodeTestDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${users}) AS v`),
    nodeTestDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${customers}) AS v`),
    nodeTestDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${invoices}) AS v`),
    nodeTestDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${revenues}) AS v`),
    nodeTestDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${demoUserCounters}) AS v`,
    ),
  ]);
  return checks.every((r) => firstRow<{ v: boolean }>(r)?.v === false);
}

/**
 * Truncate all tables used by seeds, restart identities, cascade.
 */
async function truncateAll(): Promise<void> {
  await nodeTestDb.execute(sql`TRUNCATE TABLE
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
  const shouldReset = SEED_RESET === "true";
  if (shouldReset) {
    await truncateAll();
    return true;
  }
  const empty = await isEmpty();
  if (!empty) {
    console.error(
      "Database is not empty. Set SEED_RESET=true to force reseed. Exiting...",
    );
    return false;
  }
  return true;
}
