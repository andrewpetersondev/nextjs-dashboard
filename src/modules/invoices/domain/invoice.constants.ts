export const ITEMS_PER_PAGE_INVOICES = 10;

// Payment terms: an invoice is due this many days after its issue date.
// The due date is DERIVED from `date` (no due_date column) so the overdue
// rule lives in exactly one place — see statuses/invoice-status.display.ts.
export const INVOICE_NET_DAYS = 30;
