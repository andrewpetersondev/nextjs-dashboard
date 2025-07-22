import "server-only";

import { count, eq, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import { customers, invoices } from "@/db/schema";
import { DatabaseError } from "@/errors/errors";
import type { DashboardCardData } from "@/features/data/data.types";
import { DATA_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { formatCurrency } from "@/lib/utils/utils";

/**
 * Fetches summary data for dashboard cards.
 * @param db - Drizzle database instance
 * @returns Dashboard card data
 */
export async function fetchDashboardCardData(
  db: Database,
): Promise<DashboardCardData> {
  try {
    // Use aggregate queries for performance
    const [paid, pending, totalCustomers] = await Promise.all([
      db
        .select({ value: sql<number>`sum(${invoices.amount})` })
        .from(invoices)
        .where(eq(invoices.status, "paid"))
        .then((rows) => rows[0]?.value ?? 0),
      db
        .select({ value: sql<number>`sum(${invoices.amount})` })
        .from(invoices)
        .where(eq(invoices.status, "pending"))
        .then((rows) => rows[0]?.value ?? 0),
      db
        .select({ value: count(customers.id) })
        .from(customers)
        .then((rows) => rows[0]?.value ?? 0),
    ]);

    return {
      totalCustomers,
      totalPaid: formatCurrency(paid),
      totalPending: formatCurrency(pending),
    };
  } catch (error) {
    // Structured logging for observability
    console.error("Database Error:", error);
    throw new DatabaseError(
      DATA_ERROR_MESSAGES.ERROR_FETCH_DASHBOARD_CARDS,
      error,
    );
  }
}
