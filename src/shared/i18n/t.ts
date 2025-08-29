import { enInvoices } from "@/shared/i18n/locales/en-invoices";
import type { InvoiceMessageKey } from "@/shared/invoices/messages";

type Locale = "en";

// Extend this union as you add more feature dictionaries
// Compose per-locale dictionaries (start with invoices)
const en: Record<MessageKey, string> = {
  ...enInvoices,
};

const dicts: Record<Locale, Record<MessageKey, string>> = { en };

export type MessageKey = InvoiceMessageKey;

export function t(key: MessageKey, locale: Locale = "en"): string {
  return dicts[locale][key] ?? String(key);
}
