import "server-only";
import { customers } from "@database/schema/customers";
import { invoices } from "@database/schema/invoices";
import { count, eq, ilike, or, sql } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { ITEMS_PER_PAGE } from "@/ui/navigation/pagination/pagination.constants";

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
			count: count(invoices.id),
		})
		.from(invoices)
		.innerJoin(customers, eq(invoices.customerId, customers.id))
		.where(
			or(
				ilike(customers.name, `%${query}%`),
				ilike(customers.email, `%${query}%`),
				ilike(
					sql<string>`${invoices.amount}
                ::text`,
					`%${query}%`,
				),
				ilike(
					sql<string>`${invoices.date}
                ::text`,
					`%${query}%`,
				),
				ilike(
					sql<string>`${invoices.status}
                ::text`,
					`%${query}%`,
				),
			),
		);

	// A zero count means "no matches", not a failure — count() never returns a
	// negative or null. Math.max below already yields the 1-page floor.
	// Always return at least 1 page for UX consistency
	const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

	return Math.max(totalPages, 1);
}
