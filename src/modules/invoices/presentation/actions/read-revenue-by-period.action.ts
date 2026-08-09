"use server";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import type { RevenuePeriodTotals } from "@/modules/invoices/domain/revenue/revenue.types";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch monthly revenue for the dashboard chart.
 * @returns One row per month in the window, oldest first, amounts in cents.
 */
export async function readRevenueByPeriodAction(): Promise<
	readonly RevenuePeriodTotals[]
> {
	const service = new InvoiceService(new InvoiceRepository(getAppDb()));
	const result = await service.readRevenueByPeriod();

	if (!result.ok) {
		throw result.error;
	}

	return result.value;
}
