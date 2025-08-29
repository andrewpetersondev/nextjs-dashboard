import { isDatabaseError } from "@/server/errors/guards";
import { isValidationError } from "@/shared/errors/guards";
import { isInvoiceMessageKey } from "@/shared/invoices/guards";
import {
  INVOICE_MSG,
  type InvoiceMessageKey,
} from "@/shared/invoices/messages";

export function toInvoiceErrorMessage(error: unknown): InvoiceMessageKey {
  if (isValidationError(error)) {
    const message = (error as Error).message; // capture to enable TS narrowing
    if (isInvoiceMessageKey(message)) {
      return message;
    }
    return INVOICE_MSG.INVALID_INPUT;
  }

  if (isDatabaseError(error)) {
    const message = (error as Error).message; // capture to enable TS narrowing
    if (isInvoiceMessageKey(message)) {
      return message;
    }
    return INVOICE_MSG.DB_ERROR;
  }

  return INVOICE_MSG.SERVICE_ERROR;
}
