import "server-only";

import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
/**
 * InvoiceEntity Data Access Layer (DAL) for CRUD operations on InvoiceEntity entities.
 * Uses Drizzle ORM for database access.
 */
import type { dB } from "@/src/lib/db/connection.ts";
import type { InvoiceEntity } from "@/src/lib/db/entities/invoice.ts";
import { customers, invoices } from "@/src/lib/db/schema.ts";
import type { InvoiceStatus } from "@/src/lib/definitions/enums.ts";
import type {
	CustomerId,
	FetchFilteredInvoicesData,
	FilteredInvoiceDbRow,
	InvoiceByIdDbRow,
	InvoiceId,
	LatestInvoiceDbRow,
	ModifiedLatestInvoicesData,
} from "@/src/lib/definitions/invoices.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";
import {
	toInvoiceDTO,
	toInvoiceEntity,
} from "@/src/lib/mappers/invoice.mapper.ts";
import { logError } from "@/src/lib/utils/utils.server.ts";
import { formatCurrency } from "@/src/lib/utils/utils.ts";

// --- Constants ---
const ITEMS_PER_PAGE = 6;

// --- Branded type helpers ---
export function brandInvoiceId(id: string): InvoiceId {
	return id as InvoiceId;
}

export function brandCustomerId(id: string): CustomerId {
	return id as CustomerId;
}

export function brandStatus(status: string): InvoiceStatus {
	return status as InvoiceStatus;
}

// --- DAL Functions ---

/**
 * Inserts a new invoice record into the database.
 * @param db - The Drizzle ORM database instance.
 * @param invoice - The invoice data to insert.
 * @returns The created invoice as InvoiceDTO, or null if creation failed.
 * @throws Error if the database operation fails.
 */
export async function createInvoiceInDb(
	db: dB,
	{
		customerId,
		amount,
		status,
		date,
	}: {
		customerId: CustomerId;
		amount: number;
		status: InvoiceStatus;
		date: string;
	},
): Promise<InvoiceDTO | null> {
	try {
		const [createdInvoice] = await db
			.insert(invoices)
			.values({ amount, customerId, date, status })
			.returning();
		return createdInvoice
			? toInvoiceDTO(toInvoiceEntity(createdInvoice))
			: null;
	} catch (error) {
		logError("createInvoiceInDb", error, { customerId });
		throw new Error("Database error while creating invoice.");
	}
}

/**
 * Updates an existing invoice record in the database.
 * @param db - The Drizzle ORM database instance.
 * @param id - The invoice ID to update.
 * @param invoice - The invoice data to update.
 * @returns The updated invoice as InvoiceDTO, or null if not found.
 * @throws Error if the database operation fails.
 */
export async function updateInvoiceInDb(
	db: dB,
	id: string,
	{
		customerId,
		amount,
		status,
	}: { customerId: CustomerId; amount: number; status: InvoiceStatus },
): Promise<InvoiceDTO | null> {
	try {
		const [updatedInvoice] = await db
			.update(invoices)
			.set({ amount, customerId, status })
			.where(eq(invoices.id, id))
			.returning();
		return updatedInvoice
			? toInvoiceDTO(toInvoiceEntity(updatedInvoice))
			: null;
	} catch (error) {
		logError("updateInvoiceInDb", error, { customerId, id });
		throw new Error("Database error while updating invoice.");
	}
}

/**
 * Deletes an invoice by ID.
 * @param db - The Drizzle ORM database instance.
 * @param id - The branded InvoiceId to delete.
 * @returns The deleted invoice as InvoiceDTO, or null if not found.
 * @throws Error if the database operation fails.
 */
export async function deleteInvoiceInDb(
	db: dB,
	id: InvoiceId,
): Promise<InvoiceDTO | null> {
	try {
		const [deletedInvoice] = await db
			.delete(invoices)
			.where(eq(invoices.id, id))
			.returning();
		return deletedInvoice
			? toInvoiceDTO(toInvoiceEntity(deletedInvoice))
			: null;
	} catch (error) {
		logError("deleteInvoiceInDb", error, { id });
		throw new Error("An unexpected error occurred. Please try again.");
	}
}

/**
 * Fetches the latest invoices, limited to 5.
 * @param db - The Drizzle ORM database instance.
 * @returns Array of ModifiedLatestInvoicesData.
 * @throws Error if the database operation fails.
 */
export async function fetchLatestInvoices(
	db: dB,
): Promise<ModifiedLatestInvoicesData[]> {
	try {
		const data: LatestInvoiceDbRow[] = await db
			.select({
				amount: invoices.amount,
				email: customers.email,
				id: invoices.id,
				imageUrl: customers.imageUrl,
				name: customers.name,
				status: invoices.status,
			})
			.from(invoices)
			.innerJoin(customers, eq(invoices.customerId, customers.id))
			.orderBy(desc(invoices.date))
			.limit(5);

		return data.map(
			(invoice: LatestInvoiceDbRow): ModifiedLatestInvoicesData => ({
				...invoice,
				amount: formatCurrency(invoice.amount),
				id: brandInvoiceId(invoice.id),
				status: brandStatus(invoice.status),
			}),
		);
	} catch (error: unknown) {
		logError("fetchLatestInvoices", error);
		throw new Error("Failed to fetch the latest invoices.");
	}
}

/**
 * Fetches filtered invoices with pagination.
 * @param db - The Drizzle ORM database instance.
 * @param query - Search query.
 * @param currentPage - Current page number.
 * @returns Array of FetchFilteredInvoicesData.
 * @throws Error if the database operation fails.
 */
export async function fetchFilteredInvoices(
	db: dB,
	query: string,
	currentPage: number,
): Promise<FetchFilteredInvoicesData[]> {
	const offset: number = (currentPage - 1) * ITEMS_PER_PAGE;
	try {
		const data: FilteredInvoiceDbRow[] = await db
			.select({
				amount: invoices.amount,
				date: invoices.date,
				email: customers.email,
				id: invoices.id,
				imageUrl: customers.imageUrl,
				name: customers.name,
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

		return data.map(
			(invoice: FilteredInvoiceDbRow): FetchFilteredInvoicesData => ({
				...invoice,
				id: brandInvoiceId(invoice.id),
				status: brandStatus(invoice.status),
			}),
		);
	} catch (error: unknown) {
		logError("fetchFilteredInvoices", error);
		throw new Error("Failed to fetch invoices.");
	}
}

/**
 * Fetches the total number of invoice pages for pagination.
 * @param db - The Drizzle ORM database instance.
 * @param query - Search query.
 * @returns Number of pages.
 * @throws Error if the database operation fails.
 */
export async function fetchInvoicesPages(
	db: dB,
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
		logError("fetchInvoicesPages", error);
		throw new Error("Failed to fetch the total number of invoices.");
	}
}

/**
 * Fetches an invoice by its ID.
 * @param db - The Drizzle ORM database instance.
 * @param id - The branded InvoiceId.
 * @returns InvoiceEntity or undefined if not found.
 * @throws Error if the database operation fails.
 */
export async function fetchInvoiceById(
	db: dB,
	id: InvoiceId,
): Promise<InvoiceEntity | undefined> {
	try {
		const data: InvoiceByIdDbRow[] = await db
			.select({
				amount: invoices.amount,
				customerId: invoices.customerId,
				date: invoices.date,
				id: invoices.id,
				status: invoices.status,
			})
			.from(invoices)
			.where(eq(invoices.id, id));

		return data.length > 0
			? {
					amount: data[0].amount / 100,
					customerId: brandCustomerId(data[0].customerId),
					date: data[0].date,
					id: brandInvoiceId(data[0].id),
					status: brandStatus(data[0].status),
				}
			: undefined;
	} catch (error: unknown) {
		logError("fetchInvoiceById", error, { id });
		throw new Error("Failed to fetch invoice by id.");
	}
}
