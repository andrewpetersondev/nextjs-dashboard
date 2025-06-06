import "server-only";

import { db } from "@/src/db/database";
import { customers, invoices } from "@/src/db/schema";
import type {
	CustomerId,
	InvoiceId,
	// FetchFilteredInvoicesData,
	// FetchLatestInvoicesData,
	ModifiedLatestInvoicesData,
	PaymentStatus,
} from "@/src/lib/definitions/invoices";
import { formatCurrency } from "@/src/lib/utils";
import { count, desc, eq, ilike, or, sql } from "drizzle-orm";

// --- Fix: Cast id and paymentStatus to branded types ---
function brandInvoiceId(id: string): InvoiceId {
	return id as InvoiceId;
}

function brandCustomerId(id: string): CustomerId {
	return id as CustomerId;
}

function brandPaymentStatus(status: string): PaymentStatus {
	return status as PaymentStatus;
}

export async function fetchLatestInvoices(): Promise<
	ModifiedLatestInvoicesData[]
> {
	try {
		const data = await db
			.select({
				amount: invoices.amount,
				name: customers.name,
				imageUrl: customers.imageUrl,
				email: customers.email,
				id: invoices.id,
				paymentStatus: invoices.status,
			})
			.from(invoices)
			.innerJoin(customers, eq(invoices.customerId, customers.id))
			.orderBy(desc(invoices.date))
			.limit(5);

		// --- Fix: Brand id and paymentStatus ---
		const latestInvoices: ModifiedLatestInvoicesData[] = data.map(
			(invoice) => ({
				...invoice,
				id: brandInvoiceId(invoice.id),
				paymentStatus: brandPaymentStatus(invoice.paymentStatus),
				amount: formatCurrency(invoice.amount),
			}),
		);

		return latestInvoices;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch the latest invoices.");
	}
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
	query: string,
	currentPage: number,
) {
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;
	try {
		const data = await db
			.select({
				id: invoices.id,
				amount: invoices.amount,
				date: invoices.date,
				name: customers.name,
				email: customers.email,
				imageUrl: customers.imageUrl,
				paymentStatus: invoices.status,
			})
			.from(invoices)
			.innerJoin(customers, eq(invoices.customerId, customers.id))
			.where(
				or(
					ilike(customers.name, `%${query}%`),
					ilike(customers.email, `%${query}%`),
					ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
					ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
					ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
				),
			)
			.orderBy(desc(invoices.date))
			.limit(ITEMS_PER_PAGE)
			.offset(offset);

		// --- Fix: Brand id and paymentStatus ---
		return data.map((invoice) => ({
			...invoice,
			id: brandInvoiceId(invoice.id),
			paymentStatus: brandPaymentStatus(invoice.paymentStatus),
		}));
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch invoices.");
	}
}

export async function fetchInvoicesPages(query: string): Promise<number> {
	try {
		const data: { count: number }[] = await db
			.select({
				count: count(invoices.id),
			})
			.from(invoices)
			.innerJoin(customers, eq(invoices.customerId, customers.id))
			.where(
				or(
					ilike(customers.name, `%${query}%`),
					ilike(customers.email, `%${query}%`),
					ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
					ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
					ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
				),
			);

		const result: number = data[0].count;
		const totalPages: number = Math.ceil(result / ITEMS_PER_PAGE);

		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch the total number of invoices.");
	}
}

export async function fetchInvoiceById(id: string) {
	try {
		const data = await db
			.select({
				id: invoices.id,
				amount: invoices.amount,
				status: invoices.status,
				customerId: invoices.customerId,
				date: invoices.date,
			})
			.from(invoices)
			.where(eq(invoices.id, id));

		// --- Fix: Brand id, status, customerId ---
		const result = data.map((item) => ({
			...item,
			id: brandInvoiceId(item.id),
			status: brandPaymentStatus(item.status),
			customerId: brandCustomerId(item.customerId),
			amount: item.amount / 100,
		}));
		return result[0];
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch invoice by id.");
	}
}
