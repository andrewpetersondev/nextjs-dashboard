// Allowed invoice statuses.
export const INVOICE_STATUSES = ["pending", "paid"] as const;

// Invoice status type
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// UI-facing shapes (e.g., lightweight filter types if you filter on the client)
