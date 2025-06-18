import "server-only";

import type { DB } from "@/src/db/connection";
import { customers, invoices } from "@/src/db/schema";
import type {
	CustomerField,
	CustomersTableRow,
	FormattedCustomersTableRow,
} from "@/src/lib/definitions/customers";
import { formatCurrency } from "@/src/lib/utils/utils";
import { asc, count, eq, ilike, or, sql } from "drizzle-orm";

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
				id: customers.id,
				name: customers.name,
				email: customers.email,
				imageUrl: customers.imageUrl,
				totalInvoices: count(invoices.id),
				totalPending: sql<number>`sum
                    (${invoices.amount})
                    FILTER (WHERE
                    ${invoices.status}
                    =
                    'pending'
                    )`,
				totalPaid: sql<number>`sum
                    (${invoices.amount})
                    FILTER (WHERE
                    ${invoices.status}
                    =
                    'paid'
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
				totalPending: formatCurrency(item.totalPending),
				totalPaid: formatCurrency(item.totalPaid),
			}),
		);
	} catch (error) {
		console.error("Fetch Filtered Customers Error:", error);
		throw new Error("Failed to fetch the customer table.");
	}
}
