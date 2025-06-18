import "server-only";

// todo: all code that touches the database directly should be moved to DAL

import type { DB } from "@/src/db/connection";
import type { InvoiceEntity } from "@/src/db/entities/invoice";
import { customers, invoices } from "@/src/db/schema";
import type {
	CustomerId,
	FetchFilteredInvoicesData,
	FilteredInvoiceDbRow,
	InvoiceByIdDbRow,
	InvoiceId,
	LatestInvoiceDbRow,
	ModifiedLatestInvoicesData,
	Status,
} from "@/src/lib/definitions/invoices";
import { formatCurrency } from "@/src/lib/utils";
import { count, desc, eq, ilike, or, sql } from "drizzle-orm";

// --- Branded type helpers ---
export function brandInvoiceId(id: string): InvoiceId {
	return id as InvoiceId;
}

export function brandCustomerId(id: string): CustomerId {
	return id as CustomerId;
}

export function brandStatus(status: string): Status {
	return status as Status;
}

// --- Fetch latest invoices ---
export async function fetchLatestInvoices(
	db: DB,
): Promise<ModifiedLatestInvoicesData[]> {
	try {
		const data: LatestInvoiceDbRow[] = await db
			.select({
				amount: invoices.amount,
				name: customers.name,
				imageUrl: customers.imageUrl,
				email: customers.email,
				id: invoices.id,
				status: invoices.status,
			})
			.from(invoices)
			.innerJoin(customers, eq(invoices.customerId, customers.id))
			.orderBy(desc(invoices.date))
			.limit(5);

		return data.map(
			(invoice: LatestInvoiceDbRow): ModifiedLatestInvoicesData => ({
				...invoice,
				id: brandInvoiceId(invoice.id),
				status: brandStatus(invoice.status),
				amount: formatCurrency(invoice.amount),
			}),
		);
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch the latest invoices.");
	}
}

const ITEMS_PER_PAGE = 6;

// --- Fetch filtered invoices ---
export async function fetchFilteredInvoices(
	db: DB,
	query: string,
	currentPage: number,
): Promise<FetchFilteredInvoicesData[]> {
	const offset: number = (currentPage - 1) * ITEMS_PER_PAGE;
	try {
		const data: FilteredInvoiceDbRow[] = await db
			.select({
				id: invoices.id,
				amount: invoices.amount,
				date: invoices.date,
				name: customers.name,
				email: customers.email,
				imageUrl: customers.imageUrl,
				status: invoices.status,
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

		// --- Fix: Brand id and status ---
		return data.map(
			(invoice: FilteredInvoiceDbRow): FetchFilteredInvoicesData => ({
				...invoice,
				id: brandInvoiceId(invoice.id),
				status: brandStatus(invoice.status),
			}),
		);
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch invoices.");
	}
}

// --- Fetch invoice pages count ---
export async function fetchInvoicesPages(
	db: DB,
	query: string,
): Promise<number> {
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

		const result: number = data[0]?.count ?? 0;
		return Math.ceil(result / ITEMS_PER_PAGE);
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch the total number of invoices.");
	}
}

// --- Fetch invoice by ID ---
export async function fetchInvoiceById(
	db: DB,
	id: InvoiceId,
): Promise<InvoiceEntity | undefined> {
	try {
		const data: InvoiceByIdDbRow[] = await db
			.select({
				id: invoices.id,
				amount: invoices.amount,
				status: invoices.status,
				customerId: invoices.customerId,
				date: invoices.date,
			})
			.from(invoices)
			.where(eq(invoices.id, id));

		return data.length > 0
			? {
					id: brandInvoiceId(data[0].id),
					amount: data[0].amount / 100,
					status: brandStatus(data[0].status),
					customerId: brandCustomerId(data[0].customerId),
					date: data[0].date,
				}
			: undefined;
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch invoice by id.");
	}
}
