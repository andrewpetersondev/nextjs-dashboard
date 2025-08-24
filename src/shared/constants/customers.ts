/**
 * Shared label constants for customer-related UI.
 */
export const CUSTOMER_LABELS = {
  invoices: "Invoices",
  paid: "Paid",
  pending: "Pending",
} as const;

/**
 * Shared header labels for the customers table.
 */
export const CUSTOMER_TABLE_HEADERS = {
  name: "Name",
  email: "Email",
  totalInvoices: `Total ${CUSTOMER_LABELS.invoices}`,
  totalPending: `Total ${CUSTOMER_LABELS.pending}`,
  totalPaid: `Total ${CUSTOMER_LABELS.paid}`,
} as const;

export type CustomerTableHeaderKey = keyof typeof CUSTOMER_TABLE_HEADERS;
