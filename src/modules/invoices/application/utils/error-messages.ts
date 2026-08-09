import "server-only";
import {
	INVOICE_MSG,
	type InvoiceMessageId,
} from "@/modules/invoices/domain/i18n/invoice-messages";
import { translator } from "@/modules/invoices/domain/i18n/translator";
import { AppError } from "@/shared/core/errors/core/app-error.entity";

const KNOWN_INVOICE_MESSAGE_IDS = new Set<string>(Object.values(INVOICE_MSG));

function isKnownInvoiceMessageId(value: unknown): value is InvoiceMessageId {
	return typeof value === "string" && KNOWN_INVOICE_MESSAGE_IDS.has(value);
}

/**
 * Maps a thrown value to user-facing text for the invoices UI.
 *
 * @returns The translation of `AppError.message` when it is a known invoice
 * message ID, `invalidInput` when it is not, and `serviceError` for anything
 * that is not an `AppError`.
 */
export function toInvoiceErrorMessage(error: unknown): string {
	if (!(error instanceof AppError)) {
		return translator(INVOICE_MSG.serviceError);
	}

	const id: InvoiceMessageId = isKnownInvoiceMessageId(error.message)
		? error.message
		: INVOICE_MSG.invalidInput;

	return translator(id);
}
