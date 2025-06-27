import "server-only";

import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import type { DB } from "@/src/lib/db/connection.ts";
import { customers, invoices } from "@/src/lib/db/schema.ts";
import type {
	CustomerField,
	CustomersTableRow,
	FormattedCustomersTableRow,
} from "@/src/lib/definitions/customers.ts";
import { formatCurrency } from "@/src/lib/utils/utils.ts";

export async function fetchCustomers(db: DB): Promise<CustomerField[]> {
	try {
		return await db
			.select({
				id: customers.id,
				name: customers.name,
			})
			.from(customers)
			.orderBy(asc(customers.name));
	} catch (e) {
		console.error("Database Error:", e);
		throw new Error("Failed to fetch all customers.");
	}
}

export async function fetchFilteredCustomers(
	db: DB,
	query: string,
): Promise<FormattedCustomersTableRow[]> {
	try {
		const searchCustomers: CustomersTableRow[] = await db
			.select({
				email: customers.email,
				id: customers.id,
				imageUrl: customers.imageUrl,
				name: customers.name,
				totalInvoices: count(invoices.id),
				totalPaid: sql<number>`sum
                    (${invoices.amount})
                    FILTER (WHERE
                    ${invoices.status}
                    =
                    'paid'
                    )`,
				totalPending: sql<number>`sum
                    (${invoices.amount})
                    FILTER (WHERE
                    ${invoices.status}
                    =
                    'pending'
                    )`,
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

		// Map to FormattedCustomersTable type
		return searchCustomers.map(
			(item: CustomersTableRow): FormattedCustomersTableRow => ({
				...item,
				totalPaid: formatCurrency(item.totalPaid),
				totalPending: formatCurrency(item.totalPending),
			}),
		);
	} catch (error) {
		console.error("Fetch Filtered Customers Error:", error);
		throw new Error("Failed to fetch the customer table.");
	}
}
