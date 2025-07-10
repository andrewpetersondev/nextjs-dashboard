import "server-only";

import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/connection";
import { customers, invoices } from "@/lib/db/schema";
import type {
	CustomerField,
	FormattedCustomersTableRow,
} from "@/lib/definitions/customers.types";
import { DatabaseError } from "@/lib/errors/database-error";
import { toCustomerIdBrand } from "@/lib/mappers/customer.mapper";
import { formatCurrency } from "@/lib/utils/utils";

// Constants for error messages
const ERROR_FETCH_ALL_CUSTOMERS = "Failed to fetch all customers.";
const ERROR_FETCH_FILTERED_CUSTOMERS = "Failed to fetch the customer table.";

/**
 * Fetches all customers for select options.
 * @param db - Drizzle database instance
 * @returns Array of customer fields
 */
export async function fetchCustomers(db: Db): Promise<CustomerField[]> {
	try {
		const rows = await db
			.select({
				id: customers.id,
				name: customers.name,
			})
			.from(customers)
			.orderBy(asc(customers.name));

		// Map string IDs to branded CustomerId
		return rows.map((row) => ({
			id: toCustomerIdBrand(row.id), // <-- enforce branding
			name: row.name,
		}));
	} catch (error) {
		console.error("Database Error:", error); // TODO: Replace with structured logger
		throw new DatabaseError(ERROR_FETCH_ALL_CUSTOMERS, error);
	}
}

/**
 * Fetches customers filtered by query for the customer table.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Array of formatted customer table rows
 */
export async function fetchFilteredCustomers(
	db: Db,
	query: string,
): Promise<FormattedCustomersTableRow[]> {
	try {
		const searchCustomers = await db
			.select({
				email: customers.email,
				id: customers.id,
				imageUrl: customers.imageUrl,
				name: customers.name,
				totalInvoices: count(invoices.id),
				totalPaid: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'paid')`,
				totalPending: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'pending')`,
			})
			.from(customers)
			.leftJoin(invoices, eq(customers.id, invoices.customerId))
			.where(
				or(
					ilike(customers.name, `%${query}%`),
					ilike(customers.email, `%${query}%`),
				),
			)
			.groupBy(customers.id)
			.orderBy(asc(customers.name));

		// Map string IDs to branded CustomerId
		return searchCustomers.map((item) => ({
			...item,
			id: toCustomerIdBrand(item.id), // <-- enforce branding
			totalPaid: formatCurrency(item.totalPaid),
			totalPending: formatCurrency(item.totalPending),
		}));
	} catch (error) {
		console.error("Fetch Filtered Customers Error:", error);
		throw new DatabaseError(ERROR_FETCH_FILTERED_CUSTOMERS, error);
	}
}
