import "server-only";

import type { CustomerRow } from "@/server/db/schema";
import type { CustomerId } from "@/shared/brands/domain-brands";

/**
 * Centralized error messages for the server/customers layer.
 * Keeps DAL/Repo decoupled from feature-level messages.
 */
export const CUSTOMER_SERVER_ERROR_MESSAGES = {
  FETCH_ALL_FAILED: "Failed to fetch customers.",
  FETCH_FILTERED_FAILED: "Failed to fetch filtered customers.",
  FETCH_TOTAL_FAILED: "Failed to fetch total customers count.",
} as const;

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
