import "server-only";

import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import type {
  CustomerAggregatesRowRaw,
  CustomerSelectRowRaw,
} from "@/server/customers/types";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/server/customers/types";
import type { Database } from "@/server/db/connection";
import { customers, invoices } from "@/server/db/schema";
import { DatabaseError, ValidationError } from "@/server/errors/errors";

/**
 * Fetches all customers for select options.
 * Returns a raw projection reflecting the DB selection (no branding).
 */
export async function fetchCustomersSelectDal(
  db: Database,
): Promise<CustomerSelectRowRaw[]> {
  try {
    return await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(asc(customers.name));
  } catch (error) {
    // Use structured logging in production
    console.error("Database Error:", error);
    throw new DatabaseError(
      CUSTOMER_SERVER_ERROR_MESSAGES.FETCH_ALL_FAILED,
      error,
    );
  }
}

/**
 * Fetches customers filtered by query for the customers table (raw numeric totals).
 * Returns a raw projection reflecting the DB selection (no branding).
 */
export async function fetchFilteredCustomersDal(
  db: Database,
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
    throw new DatabaseError(
      CUSTOMER_SERVER_ERROR_MESSAGES.FETCH_FILTERED_FAILED,
      error,
    );
  }
}

/**
 * Fetches the total number of customers.
 */
export async function fetchTotalCustomersCountDal(
  db: Database,
): Promise<number> {
  const value = await db
    .select({ value: count(customers.id) })
    .from(customers)
    .then((rows) => rows[0]?.value ?? 0);

  if (value === undefined) {
    throw new ValidationError(
      CUSTOMER_SERVER_ERROR_MESSAGES.FETCH_TOTAL_FAILED,
    );
  }

  return value;
}
