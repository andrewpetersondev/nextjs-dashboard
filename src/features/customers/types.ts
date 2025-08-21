import type { CustomerId } from "@/core/types/types-brands";

/**
 * DB row for customer select options.
 */
export type CustomerSelectDbRow = {
  id: CustomerId; // Branded type
  name: string;
};

/**
 * DB row for customer table queries.
 */
export type CustomerTableDbRow = {
  id: CustomerId; // Branded type
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
};

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
