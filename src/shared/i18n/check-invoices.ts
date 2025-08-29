import { enInvoices } from "@/shared/i18n/locales/en-invoices";
import {
  INVOICE_MSG,
  type InvoiceMessageKey,
} from "@/shared/invoices/messages";

// If any key is missing from enInvoices, this assignment will fail at compile time.
const _completeCheck: Record<InvoiceMessageKey, string> = enInvoices;

// Keep a usage reference so TS doesn’t erase it
void INVOICE_MSG;
