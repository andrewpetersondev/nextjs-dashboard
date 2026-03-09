import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { ITEMS_PER_PAGE } from "@/ui/pagination/pagination.constants";

/**
 * Fetches filtered invoices with pagination and customer information.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws AppError if query fails
 */
export async function fetchFilteredInvoicesDal(
	db: AppDatabase,
	query: string,
	currentPage: number,
): Promise<InvoiceListFilter[]> {
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

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
		.where(
			or(
				ilike(schema.customers.name, `%${query}%`),
				ilike(schema.customers.email, `%${query}%`),
				ilike(
					sql<string>`${schema.invoices.amount}
                ::text`,
					`%${query}%`,
				),
				ilike(
					sql<string>`${schema.invoices.date}
                ::text`,
					`%${query}%`,
				),
				ilike(
					sql<string>`${schema.invoices.status}
                ::text`,
					`%${query}%`,
				),
			),
		)
		.orderBy(desc(schema.invoices.date))
		.limit(ITEMS_PER_PAGE)
		.offset(offset);

	// TODO: Refactor. Empty result does not mean that an error occurred.
	if (!data || data.length === 0) {
		throw makeAppError("database", {
			cause: "",
			message: INVOICE_MSG.fetchFilteredFailed,
			metadata: {},
		});
	}

	return data;
}
