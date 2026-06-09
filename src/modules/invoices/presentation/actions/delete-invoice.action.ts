"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/modules/auth/presentation/session/guards/session-access.guard";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import { ROUTES } from "@/shared/routing/routes";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Server action to delete an invoice by string ID.
 *
 * Returns a Result\<InvoiceDto, AppError\> using the shared Result pattern.
 *
 * @param id - The invoice ID as a string
 */
export async function deleteInvoiceAction(
	id: string,
): Promise<Result<InvoiceDto, AppError>> {
	// Authorization: any authenticated user may manage invoices. Kept above the
	// try/catch so a no-session redirect propagates instead of being caught.
	await requireSession();

	try {
		// Input validation -> return Err instead of throwing
		if (!id) {
			return Err(
				makeAppError(APP_ERROR_KEYS.validation, {
					cause: "",
					message: INVOICE_MSG.invalidId,
					metadata: {},
				}),
			);
		}
		// Dependency injection: repository -> service
		const repo: InvoiceRepository = new InvoiceRepository(getAppDb());
		const service: InvoiceService = new InvoiceService(repo);

		// Service returns a Result; forward Err or continue on Ok
		const deleteResult: Result<InvoiceDto, AppError> =
			await service.deleteInvoice(id);
		if (!deleteResult.ok) {
			logger.error(INVOICE_MSG.serviceError, {
				context: "deleteInvoiceAction",
				error: deleteResult.error,
				id,
			});
			return Err(deleteResult.error);
		}

		const invoice: InvoiceDto = deleteResult.value;

		revalidatePath(ROUTES.dashboard.root);

		return Ok(invoice);
	} catch (error: unknown) {
		logger.error(INVOICE_MSG.serviceError, {
			context: "deleteInvoiceAction",
			error,
			id,
		});

		const appError: AppError =
			error instanceof AppError
				? error
				: makeAppError("unknown", {
						cause: "",
						message: INVOICE_MSG.serviceError,
						metadata: { error, id },
					});

		return Err(appError);
	}
}
