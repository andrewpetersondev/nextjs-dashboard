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
} from "../seed-support/inserts";
import { ensureResetOrEmpty } from "../seed-support/maintenance";
import { db } from "./config";

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
