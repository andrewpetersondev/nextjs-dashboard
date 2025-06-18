import "server-only";

/**
 * InvoiceEntity Data Access Layer (DAL) for CRUD operations on InvoiceEntity entities.
 * Uses Drizzle ORM for database access.
 */

import type { DB } from "@/src/db/connection";
import { invoices } from "@/src/db/schema";
import type { InvoiceDTO } from "@/src/dto/invoice.dto";
import type { CustomerId, Status } from "@/src/lib/definitions/invoices";
import { logError } from "@/src/lib/utils.server";
import { toInvoiceDTO, toInvoiceEntity } from "@/src/mappers/invoice.mapper";

/**
 * Inserts a new invoice record into the database.
 * @param db - The database instance.
 * @param invoice - The invoice data to insert.
 * @return The created invoice as InvoiceDTO, or null if creation failed.
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
