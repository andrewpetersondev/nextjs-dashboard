"use server";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch the most recent invoices for the dashboard overview.
 * @param limit - Maximum number of invoices to return
 * @returns Array of InvoiceListFilter
 */
export async function readLatestInvoicesAction(
	limit: number = 5,
): Promise<InvoiceListFilter[]> {
	const service = new InvoiceService(new InvoiceRepository(getAppDb()));
	const result = await service.readLatestInvoices(limit);

	if (!result.ok) {
		throw result.error;
	}

	return result.value;
}
