// server/errors/to-invoice-error-message.ts
import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import { isDatabaseError } from "@/server/errors/guards";
import { isValidationError } from "@/shared/errors/guards";

export function toInvoiceErrorMessage(error: unknown): string {
  if (isValidationError(error)) {
    return INVOICE_ERROR_MESSAGES.INVALID_INPUT;
  }
  if (isDatabaseError(error)) {
    return INVOICE_ERROR_MESSAGES.DB_ERROR;
  }
  return INVOICE_ERROR_MESSAGES.SERVICE_ERROR;
}
