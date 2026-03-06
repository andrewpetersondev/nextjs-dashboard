import "server-only";

import { invoices } from "@database/schema/invoices";
import { eq } from "drizzle-orm";
import type {
	InvoiceEntity,
	InvoiceFormEntity,
} from "@/modules/invoices/domain/entities/invoice.entity";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceId } from "@/modules/invoices/domain/types/invoice-id.brand";
import { rawDbToInvoiceEntity } from "@/modules/invoices/infrastructure/adapters/mappers/invoice.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Updates an invoice in the database.
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @returns Promise resolving to updated InvoiceEntity
 * @throws AppError if input parameters are invalid
 * @throws AppError if update fails or invoice not found
 */
export async function updateInvoiceDal(
	db: AppDatabase,
	id: InvoiceId,
	updateData: Partial<InvoiceFormEntity>,
): Promise<InvoiceEntity> {
	if (!(db && id && updateData)) {
		throw makeAppError("validation", {
			cause: "",
			message: INVOICE_MSG.invalidInput,
			metadata: {},
		});
	}

	const [updated] = await db
		.update(invoices)
		.set(updateData)
		.where(eq(invoices.id, id))
		.returning();

	if (!updated) {
		throw makeAppError("database", {
			cause: "",
			message: INVOICE_MSG.updateFailed,
			metadata: {},
		});
	}

	const result = rawDbToInvoiceEntity(updated);
	if (!result.ok) {
		throw result.error;
	}
	return result.value;
}
