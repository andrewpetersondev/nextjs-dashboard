import "server-only";

import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { CUSTOMER_ERROR_MESSAGES } from "@/features/customers/messages";
import type { CustomerField } from "@/features/customers/types";
import type {
  CustomerSelectDbRow,
  CustomerTableDbRowRaw,
} from "@/server/customers/types";
import type { Database } from "@/server/db/connection";
import { customers, invoices } from "@/server/db/schema";
import { DatabaseError, ValidationError } from "@/server/errors/errors";
import { toCustomerId } from "@/shared/brands/domain-brands";

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
 * Fetches customers filtered by query for the customer table (server: raw numeric totals).
 * Caller (feature/ui) maps to formatted UI rows.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Array of raw customer table rows with branded IDs and numeric totals
 */
export async function fetchFilteredCustomersDal(
  db: Database,
  query: string,
): Promise<CustomerTableDbRowRaw[]> {
  try {
    const rows = await db
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
      // Note: totals remain numbers; UI formatting happens in features layer
      totalPaid: Number(row.totalPaid ?? 0),
      totalPending: Number(row.totalPending ?? 0),
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
export async function fetchTotalCustomersCountDal(
  db: Database,
): Promise<number> {
  const rows = await db
    .select({ value: count(customers.id) })
    .from(customers)
    .then((rows) => rows[0]?.value ?? 0);

  if (rows === undefined) {
    throw new ValidationError(CUSTOMER_ERROR_MESSAGES.FETCH_TOTAL_FAILED);
  }

  return rows;
}
