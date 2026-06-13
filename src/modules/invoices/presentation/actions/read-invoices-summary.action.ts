"use server";
import type { InvoicesSummary } from "@/modules/invoices/application/dto/invoice.dto";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch the aggregate invoice totals for the dashboard cards.
 * @returns The invoices summary (totals for all / paid / pending)
 */
export async function readInvoicesSummaryAction(): Promise<InvoicesSummary> {
	const service = new InvoiceService(new InvoiceRepository(getAppDb()));
	const result = await service.readInvoicesSummary();

	if (!result.ok) {
		throw result.error;
	}

	return result.value;
}
