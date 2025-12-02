import "server-only";
import { desc, eq } from "drizzle-orm";
import type { InvoiceListFilter } from "@/features/invoices/domain/types";
import { INVOICE_MSG } from "@/features/invoices/lib/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { invoices } from "@/server/db/schema/invoices";
import { AppError } from "@/shared/errors/core/app-error.class";

/**
 * Fetches the latest invoices with customer information.
 * @param db - Drizzle database instance
 * @param limit - Maximum number of invoices to fetch
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws AppError if query fails
 */
export async function fetchLatestInvoicesDal(
  db: AppDatabase,
  limit = 5,
): Promise<InvoiceListFilter[]> {
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
    .orderBy(desc(invoices.date))
    .limit(limit);

  // TODO: Refactor. Empty result does not mean that an error occurred.
  if (!data || data.length === 0) {
    throw new AppError("database", {
      message: INVOICE_MSG.fetchLatestFailed,
      metadata: {
        limit,
      },
    });
  }

  return data;
}
