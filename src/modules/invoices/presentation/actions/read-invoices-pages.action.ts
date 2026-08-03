"use server";

import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import {
	DEFAULT_INVOICE_STATUS_FILTER,
	type InvoiceStatusFilter,
} from "@/modules/invoices/domain/statuses/invoice-status.filter";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string
 * @param statusFilter - Structured status filter (validated display vocabulary)
 * @returns Promise<number> - Total number of pages
 */
export async function readInvoicesPagesAction(
	query: string = "",
	statusFilter: InvoiceStatusFilter = DEFAULT_INVOICE_STATUS_FILTER,
): Promise<number> {
	try {
		const sanitizedQuery = query.trim();
		const service = new InvoiceService(new InvoiceRepository(getAppDb()));
		const result = await service.readInvoicesPages(
			sanitizedQuery,
			statusFilter,
		);

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
