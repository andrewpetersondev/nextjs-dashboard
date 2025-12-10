"use server";

import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { fetchFilteredInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-filtered";
import { getAppDb } from "@/server-core/db/db.connection";

/**
 * Server action to fetch filtered invoices for the invoices table.
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Array of InvoiceListFilter
 */
export async function readFilteredInvoicesAction(
  query = "",
  currentPage = 1,
): Promise<InvoiceListFilter[]> {
  const db = getAppDb();
  return await fetchFilteredInvoicesDal(db, query, currentPage);
}
