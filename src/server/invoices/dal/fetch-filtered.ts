import "server-only";

import { desc, eq, ilike, or, sql } from "drizzle-orm";
import type { InvoiceListFilter } from "@/features/invoices/lib/types";
import type { Database } from "@/server/db/connection";
import { customers } from "@/server/db/schema/customers";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { ITEMS_PER_PAGE } from "@/shared/ui/pagination/constants";

/**
 * Fetches filtered invoices with pagination and customer information.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws DatabaseError if query fails
 */
export async function fetchFilteredInvoicesDal(
  db: Database,
  query: string,
  currentPage: number,
): Promise<InvoiceListFilter[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const data: InvoiceListFilter[] = await db
    .select({
      amount: invoices.amount,
      customerId: invoices.customerId,
      date: invoices.date,
      email: customers.email,
      id: invoices.id,
      imageUrl: customers.imageUrl,
      name: customers.name,
      revenuePeriod: invoices.revenuePeriod,
      sensitiveData: invoices.sensitiveData,
      status: invoices.status,
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
    )
    .orderBy(desc(invoices.date))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // TODO: Refactor. Empty result does not mean that an error occurred.
  if (!data || data.length === 0) {
    throw new DatabaseError(INVOICE_MSG.FETCH_FILTERED_FAILED, {
      currentPage,
      query,
    });
  }

  return data;
}
