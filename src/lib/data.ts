import "server-only";

import { db } from "@/src/db/dev-database";
import { customers, invoices, revenues } from "@/src/db/schema";
import type {
	CustomerField,
	CustomersTableRow,
	FormattedCustomersTableRow,
} from "@/src/lib/definitions/customers";
import type { Revenue } from "@/src/lib/definitions/revenue";
import { formatCurrency } from "@/src/lib/utils";
import { asc, count, eq, ilike, or, sql } from "drizzle-orm";

export async function fetchRevenue(): Promise<Revenue[]> {
	const monthOrder: string[] = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	try {
		const data: Revenue[] = await db.select().from(revenues);

		return data.sort(
			(a: Revenue, b: Revenue): number =>
				monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
		);
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch revenue data.");
	}
}

export async function fetchCardData(): Promise<{
	invoiceCount: number;
	customerCount: number;
	paidInvoices: number;
	pendingInvoices: number;
}> {
	try {
		const invoiceCount: number = await db.$count(invoices);
		const customerCount: number = await db.$count(customers);
		const paidInvoices: number = await db.$count(
			invoices,
			eq(invoices.status, "paid"),
		);
		const pendingInvoices: number = await db.$count(
			invoices,
			eq(invoices.status, "pending"),
		);
		return {
			invoiceCount,
			customerCount,
			paidInvoices,
			pendingInvoices,
		};
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch card data.");
	}
}

export async function fetchCustomers(): Promise<CustomerField[]> {
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
				totalPending: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'pending')`,
				totalPaid: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'paid')`,
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
