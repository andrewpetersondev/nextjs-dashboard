import { isDatabaseError } from "@/server/errors/server-error-guards";
import { isValidationError } from "@/shared/core/errors/base/error-guards";
import {
  INVOICE_MSG,
  type InvoiceMessageId,
} from "@/shared/i18n/messages/invoice-messages";
import { translator } from "@/shared/i18n/translator";

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
    return translator(id);
  }

  if (isDatabaseError(error)) {
    const message = (error as Error).message;
    const id: InvoiceMessageId = isKnownInvoiceMessageId(message)
      ? message
      : INVOICE_MSG.DB_ERROR;
    return translator(id);
  }

  return translator(INVOICE_MSG.SERVICE_ERROR);
}
