import { makeMessageKeyGuard } from "@/shared/i18n/message-key-guard";
import { INVOICE_MSG } from "@/shared/invoices/messages";

export const isInvoiceMessageKey = makeMessageKeyGuard(INVOICE_MSG);
