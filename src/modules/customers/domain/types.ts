import type { CustomerRow } from "@/server-core/db/schema";
import type { CustomerId } from "@/shared/branding/brands";

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

/**
 * Raw DB shape for "select" options. Reflects the query selection in DAL.
 * Note: id is the raw DB type, not branded.
 */
export type CustomerSelectRowRaw = {
  id: CustomerRow["id"];
  name: CustomerRow["name"];
};

/**
 * Raw DB shape for the aggregated customers table query.
 * Totals from SUM(...) can be null when no matching rows exist.
 */
export type CustomerAggregatesRowRaw = {
  id: CustomerRow["id"];
  name: CustomerRow["name"];
  email: CustomerRow["email"];
  imageUrl: CustomerRow["imageUrl"];
  totalInvoices: number; // COUNT() returns 0, not null
  totalPaid: number | null; // SUM(...) can be null
  totalPending: number | null; // SUM(...) can be null
};
