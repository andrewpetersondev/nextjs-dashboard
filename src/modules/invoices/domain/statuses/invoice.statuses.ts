/** Allowed invoice status values (immutable tuple for precise type inference). */
export const INVOICE_STATUSES = ["pending", "paid"] as const;
/** String-literal union of the allowed invoice statuses derived from INVOICE_STATUSES. */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
