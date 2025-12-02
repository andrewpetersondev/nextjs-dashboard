"use server";

import "@/server/revenues/events/bootstrap/revenue-events.bootstrap";
import { INVOICE_MSG } from "@/features/invoices/lib/i18n/invoice-messages";
import { getAppDb } from "@/server/db/db.connection";
import { fetchInvoicesPagesDal } from "@/server/invoices/infrastructure/repository/dal/fetch-pages";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string
 * @returns Promise<number> - Total number of pages
 */
export async function readInvoicesPagesAction(query = ""): Promise<number> {
  try {
    const db = getAppDb();
    const sanitizedQuery = query.trim();
    const totalPages = await fetchInvoicesPagesDal(db, sanitizedQuery);

    if (!Number.isInteger(totalPages) || totalPages < 1) {
      logger.error("Invalid totalPages returned from DAL", {
        context: "readInvoicesPagesAction",
        query: sanitizedQuery,
      });
      throw new Error(INVOICE_MSG.fetchPagesFailed);
    }

    return totalPages;
  } catch (error) {
    logger.error(INVOICE_MSG.dbError, {
      context: "readInvoicesPagesAction",
      error,
      message: INVOICE_MSG.dbError,
      query,
    });
    throw new Error(INVOICE_MSG.dbError);
  }
}
