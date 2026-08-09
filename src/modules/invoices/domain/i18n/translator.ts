import { enInvoices } from "@/modules/invoices/domain/i18n/en-invoices";
import type { InvoiceMessageId } from "@/modules/invoices/domain/i18n/invoice-messages";

/**
 * Resolves an invoice message ID to English text.
 *
 * @returns The translation, or the ID itself when the dictionary lacks one — a
 * deliberate exception to the no-fallbacks rule, since a visible
 * `INVOICE.CREATE_FAILED` names its own bug where a blank string would not.
 */
export function translator(key: InvoiceMessageId): string {
	return enInvoices[key] ?? key;
}
