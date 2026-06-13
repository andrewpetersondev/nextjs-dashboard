"use server";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";

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
	const service = new InvoiceService(new InvoiceRepository(getAppDb()));
	const result = await service.readFilteredInvoices(query, currentPage);

	if (!result.ok) {
		throw result.error;
	}

	return result.value;
}
