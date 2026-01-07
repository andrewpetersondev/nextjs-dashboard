import "server-only";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { checkStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility.guard";
import { validateInvoicePeriodForRevenue } from "@/modules/revenues/domain/policies/invoice-period.policy";

/**
 * Result of an eligibility check.
 */
export type EligibilityResult =
  | { readonly eligible: false; readonly reason: string }
  | { readonly eligible: true };

/**
 * Checks if an invoice is eligible for revenue calculation.
 * Pure domain logic.
 */
export function checkInvoiceEligibility(
  invoice: InvoiceDto,
): EligibilityResult {
  // Validate the invoice structure and period
  const validationResult = validateInvoicePeriodForRevenue(invoice);
  if (!validationResult.valid) {
    return {
      eligible: false,
      reason: validationResult.reason ?? "Invalid invoice structure",
    };
  }

  // Check if the invoice has a valid amount
  if (!invoice.amount || invoice.amount <= 0) {
    return { eligible: false, reason: "Invoice has zero or negative amount" };
  }

  // Check if the invoice has a valid status
  if (!checkStatusEligibleForRevenue(invoice.status)) {
    return {
      eligible: false,
      reason: `Invoice status ${invoice.status} not eligible for revenue`,
    };
  }

  return { eligible: true };
}

/**
 * Checks if an invoice is eligible for deletion.
 */
export function checkDeletionEligibility(
  invoice: InvoiceDto,
): EligibilityResult {
  if (!checkStatusEligibleForRevenue(invoice.status)) {
    return {
      eligible: false,
      reason: "Deleted invoice was not eligible for revenue",
    };
  }
  if (invoice.amount <= 0) {
    return {
      eligible: false,
      reason: "Deleted invoice had an invalid amount",
    };
  }
  return { eligible: true };
}

// Deprecated wrapper to maintain some compatibility during refactor if strictly needed,
// but better to remove the server logging entirely from this file.
// I will remove the functions that imported logging.
