import "server-only";
import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/server/customers/messages";
import type { CustomerAggregatesRowRaw } from "@/server/customers/types";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { invoices } from "@/server/db/schema/invoices";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Fetches customers filtered by query for the customers table (raw numeric totals).
 * Returns a raw projection reflecting the DB selection (no branding).
 */
export async function fetchFilteredCustomersDal(
  db: AppDatabase,
  query: string,
): Promise<CustomerAggregatesRowRaw[]> {
  try {
    return await db
      .select({
        email: customers.email,
        id: customers.id,
        imageUrl: customers.imageUrl,
        name: customers.name,
        totalInvoices: count(invoices.id),
        totalPaid: sql<number | null>`sum(
            ${invoices.amount}
            )
            FILTER
            (
            WHERE
            ${invoices.status}
            =
            'paid'
            )`,
        totalPending: sql<number | null>`sum(
            ${invoices.amount}
            )
            FILTER
            (
            WHERE
            ${invoices.status}
            =
            'pending'
            )`,
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
        ),
      )
      .groupBy(customers.id)
      .orderBy(asc(customers.name));
  } catch (error) {
    // Use structured logging in production
    console.error("Fetch Filtered Customers Error:", error);
    throw new AppError("database", {
      message: CUSTOMER_SERVER_ERROR_MESSAGES.fetchFilteredFailed,
    });
  }
}
