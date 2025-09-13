import { enInvoices } from "@/shared/i18n/locales/en-invoices";
import type { InvoiceMessageId } from "@/shared/invoices/messages";

// Minimal translator for a single locale
export function translator(key: InvoiceMessageId): string {
  return enInvoices[key] ?? key;
}
