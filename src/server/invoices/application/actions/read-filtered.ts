"use server";

import type { InvoiceListFilter } from "@/features/invoices/domain/types";
import { getAppDb } from "@/server/db/db.connection";
import { fetchFilteredInvoicesDal } from "@/server/invoices/infrastructure/repository/dal/fetch-filtered";

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
