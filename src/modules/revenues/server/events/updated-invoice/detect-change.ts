import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { isStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility";
import type { ChangeType } from "@/modules/revenues/server/events/updated-invoice/types";

/**
 * Detects how the invoice change affects revenue eligibility/amount.
 */
export function detectChange(
  previousInvoice: InvoiceDto,
  currentInvoice: InvoiceDto,
): ChangeType {
  const prevEligible = isStatusEligibleForRevenue(previousInvoice.status);
  const currEligible = isStatusEligibleForRevenue(currentInvoice.status);
  if (prevEligible && !currEligible) {
    return "eligible-to-ineligible";
  }
  if (!prevEligible && currEligible) {
    return "ineligible-to-eligible";
  }
  // Status switched between eligible states (paid <-> pending)
  if (
    prevEligible &&
    currEligible &&
    previousInvoice.status !== currentInvoice.status
  ) {
    return "eligible-status-change";
  }
  // Same eligible status but amount changed
  if (
    prevEligible &&
    currEligible &&
    previousInvoice.amount !== currentInvoice.amount
  ) {
    return "eligible-amount-change";
  }
  return "none";
}
