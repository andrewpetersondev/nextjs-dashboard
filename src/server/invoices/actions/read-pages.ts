"use server";

import "@/server/revenues/events/revenue-events.bootstrap";
import { getDB } from "@/server/db/connection";
import { fetchInvoicesPagesDal } from "@/server/invoices/dal/fetch-pages";
import { serverLogger } from "@/server/logging/serverLogger";
import { INVOICE_MSG } from "@/shared/invoices/messages";

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string
 * @returns Promise<number> - Total number of pages
 */
export async function readInvoicesPagesAction(query = ""): Promise<number> {
  try {
    const db = getDB();
    const sanitizedQuery = query.trim();
    const totalPages = await fetchInvoicesPagesDal(db, sanitizedQuery);

    if (!Number.isInteger(totalPages) || totalPages < 1) {
      serverLogger.error({
        context: "readInvoicesPagesAction",
        message: "Invalid totalPages returned from DAL",
        query: sanitizedQuery,
      });
      throw new Error(INVOICE_MSG.FETCH_PAGES_FAILED);
    }

    return totalPages;
  } catch (error) {
    serverLogger.error({
      context: "readInvoicesPagesAction",
      error,
      message: INVOICE_MSG.DB_ERROR,
      query,
    });
    throw new Error(INVOICE_MSG.DB_ERROR);
  }
}
