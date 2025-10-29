"use server";

import "@/server/revenues/events/bootstrap/revenue-events.bootstrap";
import { getAppDb } from "@/server/db/db.connection";
import { fetchInvoicesPagesDal } from "@/server/invoices/dal/fetch-pages";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { sharedLogger } from "@/shared/logging/logger.shared";

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
      sharedLogger.error({
        context: "readInvoicesPagesAction",
        message: "Invalid totalPages returned from DAL",
        query: sanitizedQuery,
      });
      throw new Error(INVOICE_MSG.fetchPagesFailed);
    }

    return totalPages;
  } catch (error) {
    sharedLogger.error({
      context: "readInvoicesPagesAction",
      error,
      message: INVOICE_MSG.dbError,
      query,
    });
    throw new Error(INVOICE_MSG.dbError);
  }
}
