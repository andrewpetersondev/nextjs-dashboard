import "server-only";

/**
 * InvoiceEntity Data Access Layer (DAL) for CRUD operations on InvoiceEntity entities.
 * Uses Drizzle ORM for database access.
 */

import type { DB } from "@/src/db/connection";
import { invoices } from "@/src/db/schema";
import type {
	CustomerId,
	InvoiceId,
	Status,
} from "@/src/lib/definitions/invoices";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto";
import {
	toInvoiceDTO,
	toInvoiceEntity,
} from "@/src/lib/mappers/invoice.mapper";
import { logError } from "@/src/lib/utils/utils.server";
import { eq } from "drizzle-orm";

/**
 * Inserts a new invoice record into the database.
 * @param db - The Drizzle ORM database instance.
 * @param invoice - The invoice data to insert (customerId, amount, status, date).
 * @returns The created invoice as InvoiceDTO, or null if creation failed.
 * @throws Error if the database operation fails.
 */
export async function createInvoiceInDB(
	db: DB,
	{
		customerId,
		amount,
		status,
		date,
	}: { customerId: CustomerId; amount: number; status: Status; date: string },
): Promise<InvoiceDTO | null> {
	try {
		const [createdInvoice] = await db
			.insert(invoices)
			.values({ customerId, amount, status, date })
			.returning();
		return createdInvoice
			? toInvoiceDTO(toInvoiceEntity(createdInvoice))
			: null;
	} catch (error) {
		logError("createInvoiceInDB", error, { customerId });
		throw new Error("Database error while creating invoice.");
	}
}

/**
 * Updates an existing invoice record in the database.
 * @param db - The Drizzle ORM database instance.
 * @param id - The invoice ID to update.
 * @param invoice - The invoice data to update (customerId, amount, status).
 * @returns The updated invoice as InvoiceDTO, or null if not found.
 * @throws Error if the database operation fails.
 */
export async function updateInvoiceInDB(
	db: DB,
	id: string,
	{
		customerId,
		amount,
		status,
	}: { customerId: CustomerId; amount: number; status: Status },
): Promise<InvoiceDTO | null> {
	try {
		const [updatedInvoice] = await db
			.update(invoices)
			.set({ customerId, amount, status })
			.where(eq(invoices.id, id))
			.returning();
		return updatedInvoice
			? toInvoiceDTO(toInvoiceEntity(updatedInvoice))
			: null;
	} catch (error) {
		logError("updateInvoiceInDB", error, { id, customerId });
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
export async function deleteInvoiceInDB(
	db: DB,
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
		logError("deleteInvoiceInDB", error, { id });
		throw new Error("An unexpected error occurred. Please try again.");
	}
}
