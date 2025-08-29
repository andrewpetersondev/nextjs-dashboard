import { isDatabaseError } from "@/server/errors/guards";
import { isValidationError } from "@/shared/errors/guards";
import { t } from "@/shared/i18n/t";
import { INVOICE_MSG, type InvoiceMessageId } from "@/shared/invoices/messages";

// Local guard for known invoice message IDs (single-locale setup)
const KNOWN_INVOICE_MESSAGE_IDS = new Set<string>(Object.values(INVOICE_MSG));
function isKnownInvoiceMessageId(value: unknown): value is InvoiceMessageId {
  return typeof value === "string" && KNOWN_INVOICE_MESSAGE_IDS.has(value);
}

export function toInvoiceErrorMessage(error: unknown): string {
  if (isValidationError(error)) {
    const message = (error as Error).message;
    const id: InvoiceMessageId = isKnownInvoiceMessageId(message)
      ? message
      : INVOICE_MSG.INVALID_INPUT;
    return t(id);
  }

  if (isDatabaseError(error)) {
    const message = (error as Error).message;
    const id: InvoiceMessageId = isKnownInvoiceMessageId(message)
      ? message
      : INVOICE_MSG.DB_ERROR;
    return t(id);
  }

  return t(INVOICE_MSG.SERVICE_ERROR);
}
