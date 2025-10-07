import "server-only";

import { count, eq, ilike, or, sql } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { ITEMS_PER_PAGE } from "@/shared/ui/pagination/constants";

/**
 * Fetches the total number of invoice pages for pagination.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Promise resolving to total number of pages
 * @throws DatabaseError if query fails
 */
export async function fetchInvoicesPagesDal(
  db: AppDatabase,
  query: string,
): Promise<number> {
  // Count invoices matching the search query
  const [{ count: total = 0 } = { count: 0 }] = await db
    .select({
      count: count(invoices.id),
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      or(
        ilike(customers.name, `%${query}%`),
        ilike(customers.email, `%${query}%`),
        ilike(
          sql<string>`${invoices.amount}
                ::text`,
          `%${query}%`,
        ),
        ilike(
          sql<string>`${invoices.date}
                ::text`,
          `%${query}%`,
        ),
        ilike(
          sql<string>`${invoices.status}
                ::text`,
          `%${query}%`,
        ),
      ),
    );

  // TODO: Refactor. Empty result does not mean that an error occurred.
  if (!total || total < 0) {
    throw new DatabaseError(INVOICE_MSG.FETCH_PAGES_FAILED, {
      query,
      total,
    });
  }

  // Always return at least 1 page for UX consistency
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return Math.max(totalPages, 1);
}
