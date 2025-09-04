import "server-only";

import { isStatusEligibleForRevenue } from "@/server/revenues/events/common/guards";
import type { ChangeType } from "@/server/revenues/events/common/types";
import type { InvoiceDto } from "@/shared/invoices/dto";

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
  if (
    prevEligible &&
    currEligible &&
    previousInvoice.amount !== currentInvoice.amount
  ) {
    return "eligible-amount-change";
  }
  return "none";
}
