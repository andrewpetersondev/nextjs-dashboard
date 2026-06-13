"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/modules/auth/presentation/session/session-access.guard";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { translator } from "@/modules/invoices/domain/i18n/translator";
import {
	UPDATE_INVOICE_FIELDS_LIST,
	type UpdateInvoiceFieldNames,
	type UpdateInvoicePayload,
	UpdateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { AppError } from "@/shared/core/errors/core/app-error.entity";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/types/form-result.dto";
import {
	makeFormError,
	makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { toDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.mapper";
import { validateForm } from "@/shared/forms/server/validate-form";
import { ROUTES } from "@/shared/routing/routes";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

function handleActionError(id: string, error: unknown): FormResult<never> {
	logger.error(INVOICE_MSG.serviceError, {
		context: "updateInvoiceAction",
		error,
		id,
		message: INVOICE_MSG.serviceError,
	});

	return makeFormError<UpdateInvoiceFieldNames>({
		fieldErrors: toDenseFieldErrorMap<UpdateInvoiceFieldNames, string>(
			{},
			UPDATE_INVOICE_FIELDS_LIST,
		),
		formData: {},
		formErrors: [],
		key: error instanceof AppError ? error.key : "unknown",
		message: translator(
			error instanceof AppError
				? INVOICE_MSG.updateFailed
				: INVOICE_MSG.serviceError,
		),
	});
}

/**
 * Server action for updating an invoice.
 * Extracts and validates form data, then calls the service layer.
 * @param _prevState - Previous form state (unused but required by useActionState)
 * @param id - Invoice ID as a string
 * @param formData - FormData from the client
 * @returns FormResult with data, errors, message, and success
 */
export async function updateInvoiceAction(
	_prevState: FormState<UpdateInvoicePayload>,
	id: string,
	formData: FormData,
): Promise<FormResult<UpdateInvoicePayload>> {
	// Authorization: any authenticated user may manage invoices. Kept above the
	// try/catch so a no-session redirect propagates instead of being caught.
	await requireSession();

	// Validate input through the shared funnel. Echo stays off (the default):
	// nothing repopulates from invoice error metadata, and the raw payload
	// includes sensitiveData.
	const validated = await validateForm(
		formData,
		UpdateInvoiceSchema,
		UPDATE_INVOICE_FIELDS_LIST,
		{
			loggerContext: "updateInvoiceAction",
			messages: { failureMessage: translator(INVOICE_MSG.validationFailed) },
		},
	);

	if (!validated.ok) {
		return validated;
	}

	try {
		const service = new InvoiceService(new InvoiceRepository(getAppDb()));

		const updateResult = await service.updateInvoice(id, validated.value.data);
		if (!updateResult.ok) {
			return handleActionError(id, updateResult.error);
		}
		const updatedInvoice = updateResult.value;

		revalidatePath(ROUTES.dashboard.root);

		return makeFormOk(
			{
				amount: updatedInvoice.amount,
				customerId: updatedInvoice.customerId,
				date: updatedInvoice.date,
				sensitiveData: updatedInvoice.sensitiveData,
				status: updatedInvoice.status,
			},
			translator(INVOICE_MSG.updateSuccess),
		);
	} catch (error) {
		return handleActionError(id, error);
	}
}
