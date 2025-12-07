import { enInvoices } from "@/modules/invoices/domain/i18n/en-invoices";
import type { InvoiceMessageId } from "@/modules/invoices/domain/i18n/invoice-messages";

// Minimal translator for a single locale
export function translator(key: InvoiceMessageId): string {
  return enInvoices[key] ?? key;
}
