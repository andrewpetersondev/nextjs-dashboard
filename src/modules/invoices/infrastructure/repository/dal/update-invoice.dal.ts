import "server-only";
import { invoices } from "@database/schema/invoices";
import { and, eq } from "drizzle-orm";
import type {
	InvoiceEntity,
	InvoiceFormEntity,
} from "@/modules/invoices/domain/entities/invoice.entity";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import type { InvoiceId } from "@/modules/invoices/domain/types/invoice-id.brand";
import { rawDbToInvoiceEntity } from "@/modules/invoices/infrastructure/adapters/mappers/invoice.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Updates an invoice in the database.
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @param expectedStatus - When set, the UPDATE carries a status precondition
 * (`WHERE status = expectedStatus`). This is the race-proof half of the
 * transition guard: the service's read-then-check is not atomic, this is.
 * Only passed when the update actually changes status, so plain field edits
 * can never trip a false conflict.
 * @returns Promise resolving to updated InvoiceEntity
 * @throws AppError if input parameters are invalid
 * @throws AppError (conflict) if the status precondition matched zero rows
 * @throws AppError if update fails or invoice not found
 */
export async function updateInvoiceDal(
	db: AppDatabase,
	id: InvoiceId,
	updateData: Partial<InvoiceFormEntity>,
	expectedStatus?: InvoiceStatus,
): Promise<InvoiceEntity> {
	if (!(db && id && updateData)) {
		throw makeAppError("validation", {
			cause: "",
			message: INVOICE_MSG.invalidInput,
			metadata: {},
		});
	}

	const whereClause =
		expectedStatus === undefined
			? eq(invoices.id, id)
			: and(eq(invoices.id, id), eq(invoices.status, expectedStatus));

	const [updated] = await db
		.update(invoices)
		.set(updateData)
		.where(whereClause)
		.returning();

	if (!updated) {
		// With a precondition, zero rows means the status moved (or the row was
		// deleted) between the service's read and this write — a stale-state
		// conflict, not a database failure.
		if (expectedStatus !== undefined) {
			throw makeAppError(APP_ERROR_KEYS.conflict, {
				cause: "",
				message: INVOICE_MSG.statusConflict,
				metadata: {
					attemptedTo: updateData.status,
					expectedFrom: expectedStatus,
					policy: "invoice-status-transition",
					resourceId: String(id),
				},
			});
		}
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
