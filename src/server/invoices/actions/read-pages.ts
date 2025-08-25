"use server";

import "@/server/revenues/events/revenue-events.bootstrap";
import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import { getDB } from "@/server/db/connection";
import { fetchInvoicesPagesDal } from "@/server/invoices/dal";
import { logger } from "@/server/logging/logger";

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string
 * @returns Promise<number> - Total number of pages
 */
export async function readInvoicesPagesAction(
  query: string = "",
): Promise<number> {
  try {
    const db = getDB();
    const sanitizedQuery = query.trim();
    const totalPages = await fetchInvoicesPagesDal(db, sanitizedQuery);

    if (!Number.isInteger(totalPages) || totalPages < 1) {
      logger.error({
        context: "readInvoicesPagesAction",
        message: "Invalid totalPages returned from DAL",
        query: sanitizedQuery,
      });
      throw new Error(INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED);
    }

    return totalPages;
  } catch (error) {
    logger.error({
      context: "readInvoicesPagesAction",
      error,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      query,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.DB_ERROR);
  }
}
