import "server-only";

import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { CUSTOMER_ERROR_MESSAGES } from "@/errors/error-messages";
import { DatabaseError, ValidationError } from "@/errors/errors";
import type {
  CustomerField,
  CustomerSelectDbRow,
  CustomerTableDbRow,
  FormattedCustomersTableRow,
} from "@/features/customers/customer.types";
import { toCustomerId } from "@/lib/types/types.brands";
import { formatCurrency } from "@/lib/utils/utils";
import type { Database } from "@/server/db/connection";
import { customers, invoices } from "@/server/db/schema";

/**
 * Fetches all customers for select options.
 * @param db - Drizzle database instance
 * @returns Array of customer fields with branded IDs
 */
export async function fetchCustomers(db: Database): Promise<CustomerField[]> {
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
    throw new DatabaseError(CUSTOMER_ERROR_MESSAGES.FETCH_ALL_FAILED, error);
  }
}

/**
 * Fetches customers filtered by query for the customer table.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Array of formatted customer table rows with branded IDs
 */
export async function fetchFilteredCustomers(
  db: Database,
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
    throw new DatabaseError(
      CUSTOMER_ERROR_MESSAGES.FETCH_FILTERED_FAILED,
      error,
    );
  }
}

/**
 * Fetches the total number of customers.
 * @param db - Drizzle database instance
 * @returns Total number of customers
 */
export async function fetchTotalCustomersCountDal(db: Database) {
  const rows = await db
    .select({ value: count(customers.id) })
    .from(customers)
    .then((rows) => rows[0]?.value ?? 0);

  if (rows === undefined) {
    throw new ValidationError(CUSTOMER_ERROR_MESSAGES.FETCH_TOTAL_FAILED);
  }

  return rows;
}
