/**
 * @file seeds/seed-dev-db.ts
 * Seed script for initializing the test database with realistic sample data.
 *
 * - Target database: dev_db (via POSTGRES_URL)
 * - Entry point: run directly with ts-node
 * - Idempotency: refuses to seed if data exists unless SEED_RESET=true
 *
 * Quick start:
 *   POSTGRES_URL=postgres://... pnpm ts-node src/db/seeds/seed-dev-db.ts
 *   SEED_RESET=true pnpm ts-node src/db/seeds/seed-dev-db.ts # force re-seed (TRUNCATE)
 */

// biome-ignore lint/correctness/noNodejsModules: <remove rule>
import process from "node:process";
import dotenv from "dotenv";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { invoices } from "../node-only/schema/invoices";
import { users } from "../node-only/schema/users";
import {
  buildRandomInvoiceRows,
  buildUserSeed,
} from "../node-only/seed-support/builders";
import {
  aggregateRevenues,
  fetchCustomerIds,
  insertCustomers,
  insertDemoCounters,
  insertRevenues,
} from "../node-only/seed-support/inserts";
import { ensureResetOrEmpty } from "../node-only/seed-support/maintenance";

dotenv.config({ path: ".env.development" });

console.log("db-dev.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
  url = process.env.POSTGRES_URL;
} else {
  console.error("POSTGRES_URL is not set.");
  process.exit(1);
}

const nodeEnvDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });

/**
 * Main seeding function.
 */
async function devSeed(): Promise<void> {
  const proceed = await ensureResetOrEmpty();
  if (!proceed) {
    return;
  }

  const userSeed = await buildUserSeed();

  await nodeEnvDb.transaction(async (tx) => {
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
devSeed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
