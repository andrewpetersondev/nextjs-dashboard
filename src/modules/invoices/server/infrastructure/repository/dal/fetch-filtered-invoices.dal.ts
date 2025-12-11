import "server-only";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { invoices } from "@/server/db/schema/invoices";
import { AppError } from "@/shared/errors/core/app-error.class";
import { ITEMS_PER_PAGE } from "@/ui/pagination/pagination.constants";

/**
 * Fetches filtered invoices with pagination and customer information.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws AppError if query fails
 */
export async function fetchFilteredInvoicesDal(
  db: AppDatabase,
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
    throw new AppError("database", {
      message: INVOICE_MSG.fetchFilteredFailed,
      metadata: {
        currentPage,
        query,
      },
    });
  }

  return data;
}
