import "server-only";
import { invoices } from "@database/schema/invoices";
import type {
	InvoiceEntity,
	InvoiceServiceEntity,
} from "@/modules/invoices/domain/entities/invoice.entity";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { rawDbToInvoiceEntity } from "@/modules/invoices/infrastructure/adapters/mappers/invoice.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Creates a new invoice in the database.
 */
export async function createInvoiceDal(
	db: AppDatabase,
	input: InvoiceServiceEntity,
): Promise<InvoiceEntity> {
	const [createdInvoice] = await db.insert(invoices).values(input).returning();

	if (!createdInvoice) {
		throw makeAppError(APP_ERROR_KEYS.database, {
			cause: "",
			message: INVOICE_MSG.createFailed,
			metadata: {},
		});
	}

	const result = rawDbToInvoiceEntity(createdInvoice);
	if (!result.ok) {
		throw result.error;
	}
	return result.value;
}
