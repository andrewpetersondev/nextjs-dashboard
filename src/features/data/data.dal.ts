import "server-only";

import { asc, count, eq, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import { customers, invoices } from "@/db/schema";
import { DatabaseError } from "@/errors/database-error";
import type {
  DashboardCardData,
  RevenueData,
} from "@/features/data/data.types";
import { DATA_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toCustomerId } from "@/lib/definitions/brands";
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

/**
 * Fetches the latest invoices for the dashboard.
 * @param db - Drizzle database instance
 * @param limit - Number of invoices to fetch
 * @returns Array of latest invoices
 */
export async function fetchLatestInvoices(db: Database, limit = 5) {
  try {
    const rows = await db
      .select({
        amount: invoices.amount,
        customerId: invoices.customerId,
        customerName: customers.name,
        date: invoices.date,
        id: invoices.id,
        status: invoices.status,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(asc(invoices.date))
      .limit(limit);

    return rows.map((row) => ({
      amount: formatCurrency(row.amount),
      customerId: toCustomerId(row.customerId),
      customerName: row.customerName,
      date: row.date,
      id: row.id,
      status: row.status,
    }));
  } catch (error) {
    console.error("Fetch Latest Invoices Error:", error);
    throw new DatabaseError(
      DATA_ERROR_MESSAGES.ERROR_FETCH_LATEST_INVOICES,
      error,
    );
  }
}

/**
 * Fetches revenue data for the dashboard chart.
 * @param db - Drizzle database instance
 * @returns Array of revenue data points
 */
export async function fetchRevenueData(db: Database): Promise<RevenueData[]> {
  try {
    // Example: Group by month for revenue chart
    const rows = await db
      .select({
        month: sql<string>`to_char(${invoices.date}, 'YYYY-MM')`,
        revenue: sql<number>`sum(${invoices.amount})`,
      })
      .from(invoices)
      .where(eq(invoices.status, "paid"))
      .groupBy(sql`to_char(${invoices.date}, 'YYYY-MM')`)
      .orderBy(asc(sql`to_char(${invoices.date}, 'YYYY-MM')`));

    return rows.map((row) => ({
      formattedRevenue: formatCurrency(row.revenue),
      month: row.month,
      revenue: row.revenue,
    }));
  } catch (error) {
    console.error("Fetch Revenue Data Error:", error);
    throw new DatabaseError(DATA_ERROR_MESSAGES.ERROR_FETCH_REVENUE, error);
  }
}
