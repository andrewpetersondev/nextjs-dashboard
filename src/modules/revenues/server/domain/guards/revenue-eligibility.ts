import "server-only";
import type { InvoiceStatus } from "@/modules/invoices/domain/types";

/**
 * Domain guard: checks if an invoice status is eligible for revenue.
 * Pure logic; application layers may add logging around this if needed.
 */
export function isStatusEligibleForRevenue(status: InvoiceStatus): boolean {
  return status === "paid" || status === "pending";
}
