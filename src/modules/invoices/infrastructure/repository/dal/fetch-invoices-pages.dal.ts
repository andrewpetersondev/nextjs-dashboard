import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { count, eq, ilike, or, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { ITEMS_PER_PAGE } from "@/ui/pagination/pagination.constants";

/**
 * Fetches the total number of invoice pages for pagination.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Promise resolving to total number of pages
 * @throws AppError if query fails
 */
export async function fetchInvoicesPagesDal(
	db: AppDatabase,
	query: string,
): Promise<number> {
	// Count invoices matching the search query
	const [{ count: total = 0 } = { count: 0 }] = await db
		.select({
			count: count(schema.invoices.id),
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
		);

	// TODO: Refactor. Empty result does not mean that an error occurred.
	if (!total || total < 0) {
		throw makeAppError("database", {
			cause: "",
			message: INVOICE_MSG.fetchPagesFailed,
			metadata: {},
		});
	}

	// Always return at least 1 page for UX consistency
	const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

	return Math.max(totalPages, 1);
}
