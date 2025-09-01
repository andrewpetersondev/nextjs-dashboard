import * as schema from "../../src/server/db/schema";
import { buildRandomInvoiceRows, buildUserSeed } from "./builders";
import { db } from "./config";
import {
  aggregateRevenues,
  fetchCustomerIds,
  insertCustomers,
  insertDemoCounters,
  insertRevenues,
} from "./inserts";
import { ensureResetOrEmpty } from "./maintenance";

export async function mainCypTestSeed(): Promise<void> {
  const proceed = await ensureResetOrEmpty();
  if (!proceed) {
    return;
  }

  const userSeed = await buildUserSeed();

  await db.transaction(async (tx) => {
    await insertRevenues(tx);
    await insertCustomers(tx);
    const existingCustomers = await fetchCustomerIds(tx);
    const invoiceRows = buildRandomInvoiceRows(existingCustomers);
    if (invoiceRows.length > 0) {
      await tx.insert(schema.invoices).values(invoiceRows);
    }
    await insertDemoCounters(tx);
    const userValues: (typeof schema.users.$inferInsert)[] = userSeed.map(
      (u) => ({ ...u }),
    );
    await tx.insert(schema.users).values(userValues);
    await aggregateRevenues(tx);
  });

  console.log("Database seeded successfully.");
}
