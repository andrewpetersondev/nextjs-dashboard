import "server-only";
import {
  INVOICE_MSG,
  type InvoiceMessageId,
} from "@/modules/invoices/domain/i18n/invoice-messages";
import { translator } from "@/modules/invoices/domain/i18n/translator";
import { AppError } from "@/shared/errors/core/app-error.class";

const KNOWN_INVOICE_MESSAGE_IDS = new Set<string>(Object.values(INVOICE_MSG));

function isKnownInvoiceMessageId(value: unknown): value is InvoiceMessageId {
  return typeof value === "string" && KNOWN_INVOICE_MESSAGE_IDS.has(value);
}

export function toInvoiceErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    const message = (error as Error).message;
    const id: InvoiceMessageId = isKnownInvoiceMessageId(message)
      ? message
      : INVOICE_MSG.invalidInput;
    return translator(id);
  }

  if (error instanceof AppError) {
    const message = (error as Error).message;
    const id: InvoiceMessageId = isKnownInvoiceMessageId(message)
      ? message
      : INVOICE_MSG.dbError;
    return translator(id);
  }

  return translator(INVOICE_MSG.serviceError);
}
