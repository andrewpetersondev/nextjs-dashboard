import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { fetchLatestInvoicesDal } from "@/modules/invoices/infrastructure/repository/dal/fetch-latest-invoices.dal";
import type { AppDatabase } from "@/server/db/db.connection";

export async function readLatestInvoicesAction(
  db: AppDatabase,
  limit: number = 5,
): Promise<InvoiceListFilter[]> {
  return await fetchLatestInvoicesDal(db, limit);
}
