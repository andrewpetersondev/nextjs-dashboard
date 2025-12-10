import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import { checkStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility.guard";
import type { ChangeType } from "@/modules/revenues/server/events/updated-invoice/types";

/**
 * Detects how the invoice change affects revenue eligibility/amount.
 */
export function detectChange(
  previousInvoice: InvoiceDto,
  currentInvoice: InvoiceDto,
): ChangeType {
  const prevEligible = checkStatusEligibleForRevenue(previousInvoice.status);
  const currEligible = checkStatusEligibleForRevenue(currentInvoice.status);
  if (prevEligible && !currEligible) {
    return "eligible-to-ineligible";
  }
  if (!prevEligible && currEligible) {
    return "ineligible-to-eligible";
  }

  if (
    prevEligible &&
    currEligible &&
    previousInvoice.status !== currentInvoice.status
  ) {
    return "eligible-status-change";
  }

  if (
    prevEligible &&
    currEligible &&
    previousInvoice.amount !== currentInvoice.amount
  ) {
    return "eligible-amount-change";
  }
  return "none";
}
