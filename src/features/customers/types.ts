import type { CustomerId } from "@/shared/brands/domain-brands";

/**
 * Customer field for select options.
 */
export type CustomerField = {
  id: CustomerId;
  name: string;
};

/**
 * Formatted customer table row for UI.
 */
export type FormattedCustomersTableRow = {
  id: CustomerId;
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPaid: string; // Formatted currency
  totalPending: string; // Formatted currency
};
