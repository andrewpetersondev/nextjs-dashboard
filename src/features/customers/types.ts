import type { CustomerId } from "@/shared/branding/domain-brands";

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

/**
 * Server DTOs returned by the repository (branded, normalized).
 * These are internal to the server layer and not feature-specific.
 */
export type CustomerSelectServerDto = {
  id: CustomerId;
  name: string;
};

export type CustomerAggregatesServerDto = {
  id: CustomerId;
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPaid: number; // normalized to 0 when null in raw
  totalPending: number; // normalized to 0 when null in raw
};
