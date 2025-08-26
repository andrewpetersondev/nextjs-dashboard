"use server";

import { getDB } from "@/server/db/connection";
import { fetchFilteredInvoicesDal } from "@/server/invoices/dal/fetch-filtered";
import type { InvoiceListFilter } from "@/shared/invoices/invoices";

/**
 * Server action to fetch filtered invoices for the invoices table.
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Array of InvoiceListFilter
 */
export async function readFilteredInvoicesAction(
  query: string = "",
  currentPage: number = 1,
): Promise<InvoiceListFilter[]> {
  const db = getDB();
  return await fetchFilteredInvoicesDal(db, query, currentPage);
}
