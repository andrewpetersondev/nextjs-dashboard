"use server";

import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Loads one invoice for the edit form.
 *
 * Throws rather than returning a `Result`, unlike most of this module — the
 * caller is a page that wants an error boundary, not a form that renders field
 * errors.
 *
 * @throws Always as a `database` AppError carrying `INVOICE_MSG.dbError`. The
 * catch-all rewraps every failure, so an empty id and a genuine query fault are
 * indistinguishable to the caller despite the more specific errors raised
 * inside.
 */
export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
	try {
		if (!id) {
			throw makeAppError("validation", {
				cause: "",
				message: INVOICE_MSG.invalidId,
				metadata: {},
			});
		}
		const repo = new InvoiceRepository(getAppDb());
		const service = new InvoiceService(repo);
		const result = await service.readInvoice(id);
		if (!result.ok) {
			throw makeAppError(result.error.key, {
				cause: "",
				message: result.error.message,
				metadata: result.error.metadata,
			});
		}
		return result.value;
	} catch (error) {
		throw makeAppError("database", {
			cause: Error.isError(error) ? error : "fix this later",
			message: INVOICE_MSG.dbError,
			metadata: {},
		});
	}
}
