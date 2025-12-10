import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { fetchLatestInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-latest-invoices.dal";
import type { AppDatabase } from "@/server-core/db/db.connection";

export async function readLatestInvoicesAction(
  db: AppDatabase,
  limit = 5,
): Promise<InvoiceListFilter[]> {
  return await fetchLatestInvoicesDal(db, limit);
}
