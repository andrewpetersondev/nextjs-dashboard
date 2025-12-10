export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
