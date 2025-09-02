/**
 * @file seeds/seed-test-db.ts
 * Seed script for initializing the test database with realistic sample data.
 *
 * - Target database: test_db (via POSTGRES_URL_TESTDB)
 * - Entry point: run directly with ts-node
 * - Idempotency: refuses to seed if data exists unless SEED_RESET=true
 *
 * Quick start:
 *   POSTGRES_URL_TESTDB=postgres://... pnpm ts-node src/db/seeds/seed-test-db.ts
 *   SEED_RESET=true pnpm ts-node src/db/seeds/seed-test-db.ts # force re-seed (TRUNCATE)
 */

import process from "node:process";
import { invoices } from "../schema/invoices";
import { users } from "../schema/users";
import {
  buildRandomInvoiceRows,
  buildUserSeed,
} from "../seed-support/builders";
import {
  aggregateRevenues,
  fetchCustomerIds,
  insertCustomers,
  insertDemoCounters,
  insertRevenues,
} from "../test-support/inserts";
import { ensureResetOrEmpty } from "../test-support/maintenance";
import { nodeTestDb } from "./config-test";

/**
 * Main seeding function.
 */
async function testSeed(): Promise<void> {
  const proceed = await ensureResetOrEmpty();
  if (!proceed) {
    return;
  }

  const userSeed = await buildUserSeed();

  await nodeTestDb.transaction(async (tx) => {
    await insertRevenues(tx);
    await insertCustomers(tx);
    const existingCustomers = await fetchCustomerIds(tx);
    const invoiceRows = buildRandomInvoiceRows(existingCustomers);
    if (invoiceRows.length > 0) {
      await tx.insert(invoices).values(invoiceRows);
    }
    await insertDemoCounters(tx);
    const userValues: (typeof users.$inferInsert)[] = userSeed.map((u) => ({
      ...u,
    }));
    await tx.insert(users).values(userValues);
    await aggregateRevenues(tx);
  });

  console.log("Database seeded successfully.");
}

// Execute seeding with proper error handling and process exit
testSeed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
