import "server-only";
import { customers } from "@database/schema/customers";
import { invoices } from "@database/schema/invoices";
import { count, eq } from "drizzle-orm";
import {
	buildInvoiceListWhere,
	type InvoiceListWhereInput,
} from "@/modules/invoices/infrastructure/repository/dal/invoice-list-where";
import type { AppDatabase } from "@/server/db/db.connection";
import { ITEMS_PER_PAGE } from "@/ui/navigation/pagination/pagination.constants";

/**
 * Fetches the total number of invoice pages for pagination.
 * Uses the SAME where-builder as the rows DAL — a filter applied to one but
 * not the other silently breaks pagination.
 * @param db - Drizzle database instance
 * @param listQuery - Search text + status filter + overdue cutoff bundle
 * @returns Promise resolving to total number of pages
 * @throws AppError if query fails
 */
export async function fetchInvoicesPagesDal(
	db: AppDatabase,
	listQuery: InvoiceListWhereInput,
): Promise<number> {
	// Count invoices matching the search query + status filter
	const [{ count: total = 0 } = { count: 0 }] = await db
		.select({
			count: count(invoices.id),
		})
		.from(invoices)
		.innerJoin(customers, eq(invoices.customerId, customers.id))
		.where(buildInvoiceListWhere(listQuery));

	// A zero count means "no matches", not a failure — count() never returns a
	// negative or null. Math.max below already yields the 1-page floor.
	// Always return at least 1 page for UX consistency
	const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

	return Math.max(totalPages, 1);
}
