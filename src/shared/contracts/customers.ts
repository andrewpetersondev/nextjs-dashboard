import type { CustomerId } from "@/shared/brands/domain-brands";

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
