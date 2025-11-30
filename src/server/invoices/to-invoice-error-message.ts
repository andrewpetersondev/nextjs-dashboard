import "server-only";
import { AppError } from "@/shared/errors/app-error";
import {
  INVOICE_MSG,
  type InvoiceMessageId,
} from "@/shared/i18n/messages/invoice-messages";
import { translator } from "@/shared/i18n/translator";

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
