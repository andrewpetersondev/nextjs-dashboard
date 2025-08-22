// src/server/customers/types.server.ts
import type { CustomerId } from "@/shared/brands/domain-brands";

/**
 * DB row for customer select options (server-side shape).
 */
export type CustomerSelectDbRow = {
  id: CustomerId; // Branded type
  name: string;
};

/**
 * Raw DB row for customers table queries.
 * Totals are numeric; UI is responsible for formatting.
 */
export type CustomerTableDbRowRaw = {
  id: CustomerId;
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
};
