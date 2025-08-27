import type { CustomerId } from "@/shared/brands/domain-brands";

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
  email: "Email",
  name: "Name",
  totalInvoices: `Total ${CUSTOMER_LABELS.invoices}`,
  totalPaid: `Total ${CUSTOMER_LABELS.paid}`,
  totalPending: `Total ${CUSTOMER_LABELS.pending}`,
} as const;

export type CustomerTableHeaderKey = keyof typeof CUSTOMER_TABLE_HEADERS;

/**
 * Contract for a customers table item exchanged between server and feature layers.
 * - Server provides numeric aggregates (already normalized, e.g., null -> 0).
 * - Feature/UI is responsible for display formatting (e.g., currency).
 */
export type CustomersTableContract = {
  id: CustomerId;
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPaid: number; // numeric amount (e.g., cents or minor units)
  totalPending: number; // numeric amount (e.g., cents or minor units)
};
