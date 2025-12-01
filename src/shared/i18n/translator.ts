import { enInvoices } from "@/shared/i18n/en-invoices";
import type { InvoiceMessageId } from "@/shared/i18n/invoice-messages";

// Minimal translator for a single locale
export function translator(key: InvoiceMessageId): string {
  return enInvoices[key] ?? key;
}
