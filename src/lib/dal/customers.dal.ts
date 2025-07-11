import "server-only";

import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/connection";
import { customers, invoices } from "@/lib/db/schema";
import { toCustomerId } from "@/lib/definitions/brands";
import type {
  CustomerField,
  CustomerSelectDbRow,
  CustomerTableDbRow,
  FormattedCustomersTableRow,
} from "@/lib/definitions/customers.types";
import { DatabaseError } from "@/lib/errors/database-error";
import { formatCurrency } from "@/lib/utils/utils";

// Error message constants
const ERROR_FETCH_ALL_CUSTOMERS = "Failed to fetch all customers.";
const ERROR_FETCH_FILTERED_CUSTOMERS = "Failed to fetch the customer table.";

/**
 * Fetches all customers for select options.
 * @param db - Drizzle database instance
 * @returns Array of customer fields with branded IDs
 */
export async function fetchCustomers(db: Db): Promise<CustomerField[]> {
  try {
    const rows: CustomerSelectDbRow[] = await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(asc(customers.name));

    return rows.map((row) => ({
      id: toCustomerId(row.id),
      name: row.name,
    }));
  } catch (error) {
    // Use structured logging in production
    console.error("Database Error:", error);
    throw new DatabaseError(ERROR_FETCH_ALL_CUSTOMERS, error);
  }
}

/**
 * Fetches customers filtered by query for the customer table.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Array of formatted customer table rows with branded IDs
 */
export async function fetchFilteredCustomers(
  db: Db,
  query: string,
): Promise<FormattedCustomersTableRow[]> {
  try {
    const rows: CustomerTableDbRow[] = await db
      .select({
        email: customers.email,
        id: customers.id,
        imageUrl: customers.imageUrl,
        name: customers.name,
        totalInvoices: count(invoices.id),
        totalPaid: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'paid')`,
        totalPending: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'pending')`,
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

    return rows.map((row) => ({
      ...row,
      id: toCustomerId(row.id),
      totalPaid: formatCurrency(row.totalPaid),
      totalPending: formatCurrency(row.totalPending),
    }));
  } catch (error) {
    // Use structured logging in production
    console.error("Fetch Filtered Customers Error:", error);
    throw new DatabaseError(ERROR_FETCH_FILTERED_CUSTOMERS, error);
  }
}
