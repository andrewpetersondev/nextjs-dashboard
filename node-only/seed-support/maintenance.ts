import { sql } from "drizzle-orm";
import { nodeDb } from "../cli/node-db";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { invoices } from "../schema/invoices";
import { revenues } from "../schema/revenues";
import { users } from "../schema/users";
import { firstRow } from "./pg-utils";

/**
 * Check if all relevant tables are empty.
 */
async function isEmpty(): Promise<boolean> {
  const checks = await Promise.all([
    nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${users}) AS v`),
    nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${customers}) AS v`),
    nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${invoices}) AS v`),
    nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${revenues}) AS v`),
    nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${demoUserCounters}) AS v`),
  ]);
  return checks.every((r) => firstRow<{ v: boolean }>(r)?.v === false);
}

/**
 * Ensures DB is empty or resets it if SEED_RESET=true.
 * Returns true if it is safe to proceed with seeding.
 */
export async function ensureResetOrEmpty(): Promise<boolean> {
  const empty = await isEmpty();
  if (!empty) {
    console.error(
      "Database is not empty. Set SEED_RESET=true to force reseed. Exiting...",
    );
    return false;
  }
  return true;
}
