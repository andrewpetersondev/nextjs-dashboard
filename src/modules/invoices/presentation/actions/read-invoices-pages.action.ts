"use server";

import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string
 * @returns Promise<number> - Total number of pages
 */
export async function readInvoicesPagesAction(
	query: string = "",
): Promise<number> {
	try {
		const sanitizedQuery = query.trim();
		const service = new InvoiceService(new InvoiceRepository(getAppDb()));
		const result = await service.readInvoicesPages(sanitizedQuery);

		if (!result.ok) {
			throw result.error;
		}

		const totalPages = result.value;

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
