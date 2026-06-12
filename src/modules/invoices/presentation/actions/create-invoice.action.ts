"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/modules/auth/presentation/session/guards/session-access.guard";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { toInvoiceErrorMessage } from "@/modules/invoices/application/utils/error-messages";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { translator } from "@/modules/invoices/domain/i18n/translator";
import {
	CREATE_INVOICE_FIELDS_LIST,
	type CreateInvoiceFieldNames,
	type CreateInvoicePayload,
	CreateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/types/form-result.dto";
import {
	makeFormError,
	makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { toDenseFieldErrorMapFromZod } from "@/shared/forms/server/mappers/zod-error.mapper";
import { validateForm } from "@/shared/forms/server/validate-form";
import { isZodErrorInstance } from "@/shared/policies/zod/zod.guard";
import { ROUTES } from "@/shared/routing/routes";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Server action for creating a new invoice.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
export async function createInvoiceAction(
	_prevState: FormState<CreateInvoicePayload>,
	formData: FormData,
): Promise<FormResult<CreateInvoicePayload>> {
	// Authorization: any authenticated user may manage invoices. Kept above the
	// try/catch below so a no-session redirect propagates instead of being caught.
	await requireSession();

	// 1. Validate input through the shared funnel. Echo stays off (the default):
	// nothing repopulates from invoice error metadata, and the raw payload
	// includes sensitiveData.
	const validated = await validateForm(
		formData,
		CreateInvoiceSchema,
		CREATE_INVOICE_FIELDS_LIST,
		{
			loggerContext: "createInvoiceAction",
			messages: { failureMessage: translator(INVOICE_MSG.validationFailed) },
		},
	);

	if (!validated.ok) {
		return validated;
	}

	const payload = validated.value.data;

	// 2. Perform Async Operation
	try {
		const repo = new InvoiceRepository(getAppDb());
		const service = new InvoiceService(repo);
		const result = await service.createInvoice(payload);

		if (!result.ok) {
			return makeFormError<CreateInvoiceFieldNames>({
				fieldErrors: {
					amount: [],
					customerId: [],
					date: [],
					sensitiveData: [],
					status: [],
				},
				formData: {},
				formErrors: [],
				key: isAppError(result.error) ? result.error.key : "unknown",
				message: toInvoiceErrorMessage(result.error),
			});
		}

		// 3. Success: Revalidate but do NOT redirect so the form can show the success message
		revalidatePath(ROUTES.dashboard.invoices);
		return makeFormOk(payload, translator(INVOICE_MSG.createSuccess));
	} catch (error) {
		// Decide the top-level user-facing message based on error type
		const baseMessage = isZodErrorInstance(error)
			? translator(INVOICE_MSG.validationFailed)
			: toInvoiceErrorMessage(error);

		logger.error(baseMessage, {
			context: "createInvoiceAction",
			error,
			message: baseMessage,
		});

		return makeFormError<CreateInvoiceFieldNames>({
			fieldErrors: isZodErrorInstance(error)
				? toDenseFieldErrorMapFromZod(error, CREATE_INVOICE_FIELDS_LIST)
				: ({} as Readonly<Record<CreateInvoiceFieldNames, readonly string[]>>),
			formData: {},
			formErrors: [],
			key: isAppError(error) ? error.key : "unknown",
			message: baseMessage,
		});
	}
}
