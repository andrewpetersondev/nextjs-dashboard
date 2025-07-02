import "server-only";

import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
/**
 * Data Access Layer (DAL) for CRUD operations on Invoice entities (aka. database rows).
 * Uses Drizzle ORM for database access.
 */
import type { Db } from "@/src/lib/db/connection.ts";
import type { InvoiceEntity } from "@/src/lib/db/entities/invoice.ts";
import { customers, invoices } from "@/src/lib/db/schema.ts";
import { ITEMS_PER_PAGE } from "@/src/lib/definitions/constants.ts";
import type {
	FetchFilteredInvoicesData,
	FilteredInvoiceDbRow,
	InvoiceId,
	ModifiedLatestInvoicesData,
} from "@/src/lib/definitions/invoices.types.ts";
import type { InvoiceDto } from "@/src/lib/dto/invoice.dto.ts";
import {
	toInvoiceDto,
	toInvoiceEntity,
	toInvoiceIdBrand,
	toInvoiceStatusBrand,
} from "@/src/lib/mappers/invoice.mapper.ts";
import { logError } from "@/src/lib/utils/utils.server.ts";
import { formatCurrency } from "@/src/lib/utils/utils.ts";

/**
 * Inserts a new invoice record into the database.
 * @param db - The Drizzle ORM database instance.
 * @param invoice - The invoice data to insert.
 * @returns The created invoice DTO if successful, or null.
 */
export async function createInvoiceDal(
	db: Db,
	invoice: Pick<InvoiceEntity, "amount" | "customerId" | "date" | "status">,
): Promise<InvoiceDto | null> {
	const { amount, customerId, date, status } = invoice;
	try {
		// Ensure parameters are branded before calling this function.
		const [createdInvoice] = await db
			.insert(invoices)
			.values({ amount, customerId, date, status })
			.returning();

		if (!createdInvoice) {
			return null;
		}

		return createdInvoice ? toInvoiceDto(toInvoiceEntity(createdInvoice)) : null;
	} catch (error) {
		logError("createInvoiceDal", error, { customerId });
		throw new Error("Failed to create an invoice in a database.");
	}
}

/**
 * Fetches an invoice by its ID.
 * @param db - The Drizzle ORM database instance.
 * @param id - The branded InvoiceId.
 * @returns InvoiceDto or null if not found.
 * @throws Error if the database operation fails.
 */
export async function readInvoiceDal(
	db: Db,
	id: InvoiceId,
): Promise<InvoiceDto | null> {
	try {
		const data = await db
			.select({
				amount: invoices.amount,
				customerId: invoices.customerId,
				date: invoices.date,
				id: invoices.id,
				status: invoices.status,
			})
			.from(invoices)
			.where(eq(invoices.id, id));

		return data.length > 0 ? toInvoiceDto(toInvoiceEntity(data[0])) : null;
	} catch (error: unknown) {
		logError("readInvoiceDal", error, { id });
		throw new Error("Failed to fetch invoice by id.");
	}
}

/**
 * Updates an existing invoice record in the database.
 * @param db - The Drizzle ORM database instance.
 * @param id - The invoice ID to update.
 * @param invoice - The invoice data to update (customerId, amount, status).
 * @returns The updated invoice as InvoiceDto, or null if not found.
 * @throws Error if the database operation fails.
 */
export async function updateInvoiceDal(
	db: Db,
	id: InvoiceId,
	invoice: Pick<InvoiceEntity, "amount" | "customerId" | "status">,
): Promise<InvoiceDto | null> {
	try {
		const { amount, customerId, status } = invoice;

		const [updated] = await db
			.update(invoices)
			.set({ amount, customerId, status })
			.where(eq(invoices.id, id))
			.returning();
		return updated ? toInvoiceDto(toInvoiceEntity(updated)) : null;
	} catch (error) {
		logError("updateInvoiceDal", error, { id, ...invoice });
		throw new Error("Database error while updating invoice.");
	}
}

/**
 * Deletes an invoice by ID.
 * @param db - The Drizzle ORM database instance.
 * @param id - The branded InvoiceId to delete.
 * @returns The deleted invoice as InvoiceDto, or null if not found.
 * @throws Error if the database operation fails.
 */
export async function deleteInvoiceDal(
	db: Db,
	id: InvoiceId,
): Promise<InvoiceDto | null> {
	try {
		const [deletedInvoice] = await db
			.delete(invoices)
			.where(eq(invoices.id, id))
			.returning();
		return deletedInvoice ? toInvoiceDto(toInvoiceEntity(deletedInvoice)) : null;
	} catch (error) {
		logError("deleteInvoiceDal", error, { id });
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
	db: Db,
): Promise<ModifiedLatestInvoicesData[]> {
	try {
		const latestInvoices = await db
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

		return latestInvoices.map((invoice) => ({
			...invoice,
			amount: formatCurrency(invoice.amount),
			id: toInvoiceIdBrand(invoice.id),
			status: toInvoiceStatusBrand(invoice.status),
		}));
	} catch (error) {
		logError("fetchLatestInvoices", error);
		throw new Error("Failed to fetch the latest invoices.");
	}
}

/**
 * Fetches filtered invoices with pagination.
 * @param db - The Drizzle ORM database instance.
 * @param query - Search a query.
 * @param currentPage - Current page number.
 * @returns Array of FetchFilteredInvoicesData.
 * @throws Error if the database operation fails.
 */
export async function fetchFilteredInvoices(
	db: Db,
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
				id: toInvoiceIdBrand(invoice.id),
				status: toInvoiceStatusBrand(invoice.status),
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
 * @param query - Search a query.
 * @returns Number of pages.
 * @throws Error if the database operation fails.
 */
export async function fetchInvoicesPages(
	db: Db,
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
