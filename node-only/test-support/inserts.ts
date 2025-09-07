import { sql } from "drizzle-orm";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { revenues } from "../schema/revenues";
import { SEED_CONFIG } from "../seed-support/constants";
import { customersData, periodDates, roles } from "../seed-support/seed-shared";
import type { Tx } from "./types";

/** Insert revenues rows for each period. */
export async function insertRevenues(tx: Tx): Promise<void> {
  await tx
    .insert(revenues)
    .values(
      periodDates.map((periodDate) => ({
        calculationSource: "seed" as const,
        invoiceCount: 0,
        period: periodDate,
        totalAmount: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
      })),
    )
    .onConflictDoUpdate({
      set: {
        calculationSource: "seed",
        invoiceCount: 0,
        totalAmount: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
        updatedAt: new Date(),
      },
      target: revenues.period,
    });
}

/** Insert demo customers. */
export async function insertCustomers(tx: Tx): Promise<void> {
  await tx.insert(customers).values(
    customersData.map((c) => ({
      email: c.email,
      imageUrl: c.imageUrl,
      name: c.name,
    })),
  );
}

/** Fetch all customer ids after insertion. */
export async function fetchCustomerIds(
  tx: Tx,
): Promise<ReadonlyArray<{ readonly id: string }>> {
  const rows = await tx.select({ id: customers.id }).from(customers);
  if (rows.length === 0) {
    throw new Error("No customers found after seeding customers.");
  }
  return rows as ReadonlyArray<{ readonly id: string }>;
}

/** Insert demo counters for each role. */
export async function insertDemoCounters(tx: Tx): Promise<void> {
  await tx.insert(demoUserCounters).values(
    roles.map((role) => ({
      count:
        Math.floor(
          Math.random() *
            (SEED_CONFIG.DEMO_COUNTER_MAX - SEED_CONFIG.DEMO_COUNTER_MIN + 1),
        ) + SEED_CONFIG.DEMO_COUNTER_MIN,
      role,
    })),
  );
}

/** Aggregate revenues from invoices into revenues table. */
export async function aggregateRevenues(tx: Tx): Promise<void> {
  await tx.execute(sql`
      UPDATE revenues AS r
      SET total_amount         = COALESCE(agg.total_amount, 0),
          total_paid_amount    = COALESCE(agg.total_paid_amount, 0),
          total_pending_amount = COALESCE(agg.total_pending_amount, 0),
          invoice_count        = COALESCE(agg.invoice_count, 0),
          updated_at           = NOW()
      FROM (
        SELECT
          invoices.revenue_period AS period,
          SUM(invoices.amount) AS total_amount,
          SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid_amount,
          SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending_amount,
          COUNT(*) AS invoice_count
        FROM invoices
        GROUP BY invoices.revenue_period
      ) AS agg
      WHERE r.period = agg.period;
    `);
}
