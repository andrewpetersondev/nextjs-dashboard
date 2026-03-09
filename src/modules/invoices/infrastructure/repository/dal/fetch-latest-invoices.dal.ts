import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { desc, eq } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Fetches the latest invoices with customer information.
 * @param db - Drizzle database instance
 * @param limit - Maximum number of invoices to fetch
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws AppError if query fails
 */
export async function fetchLatestInvoicesDal(
	db: AppDatabase,
	limit: number = 5,
): Promise<InvoiceListFilter[]> {
	const data: InvoiceListFilter[] = await db
		.select({
			amount: schema.invoices.amount,
			customerId: schema.invoices.customerId,
			date: schema.invoices.date,
			email: schema.customers.email,
			id: schema.invoices.id,
			imageUrl: schema.customers.imageUrl,
			name: schema.customers.name,
			revenuePeriod: schema.invoices.revenuePeriod,
			sensitiveData: schema.invoices.sensitiveData,
			status: schema.invoices.status,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.customers,
			eq(schema.invoices.customerId, schema.customers.id),
		)
		.orderBy(desc(schema.invoices.date))
		.limit(limit);

	// TODO: Refactor. Empty result does not mean that an error occurred.
	if (!data || data.length === 0) {
		throw makeAppError("database", {
			cause: "",
			message: INVOICE_MSG.fetchLatestFailed,
			metadata: {},
		});
	}

	return data;
}
