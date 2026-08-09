/**
 * How many invoices the dashboard's "latest invoices" panel requests.
 *
 * Despite the name this is **not** the invoices table's page size — that comes
 * from the shared `ITEMS_PER_PAGE` in `ui/navigation/pagination`, which the
 * invoices DAL imports directly. The only caller is the dashboard overview.
 */
export const ITEMS_PER_PAGE_INVOICES = 10;

/**
 * Payment terms: an invoice falls due this many days after its issue date.
 *
 * The due date is derived from `date` rather than stored — there is no
 * `due_date` column — so the overdue rule lives in exactly one place. See
 * `statuses/invoice-status.display.ts`.
 */
export const INVOICE_NET_DAYS = 30;
