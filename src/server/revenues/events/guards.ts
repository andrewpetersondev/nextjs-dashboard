import "server-only";

import {
  type LogMetadata,
  logError,
  logInfo,
} from "@/server/revenues/events/logging";
import { validateInvoicePeriodForRevenue } from "@/server/revenues/events/policy";
import type { InvoiceDto } from "@/shared/invoices/dto";
import type { InvoiceStatus } from "@/shared/invoices/types";

/**
 * Checks if an invoice status is eligible for revenue
 */
export function isStatusEligibleForRevenue(status: InvoiceStatus): boolean {
  return status === "paid" || status === "pending";
}

/**
 * Checks if an invoice is eligible for revenue calculation.
 */
export function isInvoiceEligibleForRevenue(
  invoice: InvoiceDto,
  contextMethod: string,
): boolean {
  const context = `RevenueEventHandler.${contextMethod}`;

  try {
    // Validate the invoice
    const validationResult = validateInvoicePeriodForRevenue(invoice);

    if (!validationResult.valid) {
      logInfo(
        context,
        `Invoice not eligible for revenue: ${validationResult.reason}`,
        {
          invoice: invoice.id ?? null,
          reason: validationResult.reason ?? null,
        },
      );
      return false;
    }

    // Check if the invoice has a valid amount
    if (!invoice.amount || invoice.amount <= 0) {
      logInfo(context, "Invoice has zero or negative amount, skipping", {
        invoice: invoice.id ?? null,
      });
      return false;
    }

    // Check if the invoice has a valid status
    if (!isStatusEligibleForRevenue(invoice.status)) {
      logInfo(
        context,
        `Invoice status ${invoice.status} not eligible for revenue`,
        {
          invoice: invoice.id,
          status: invoice.status,
        },
      );
      return false;
    }

    return true;
  } catch (error) {
    logError(context, "Error checking invoice eligibility for revenue", error, {
      invoice: invoice.id ?? null,
    });
    return false;
  }
}

/**
 * Checks if an invoice is eligible for deletion.
 */
export function isEligibleDeletion(
  invoice: InvoiceDto,
  context: string,
  metadata: LogMetadata,
): boolean {
  if (!isStatusEligibleForRevenue(invoice.status)) {
    logInfo(
      context,
      "Deleted invoice was not eligible for revenue, no adjustment needed",
      { ...metadata, status: invoice.status },
    );
    return false;
  }
  if (invoice.amount <= 0) {
    logInfo(
      context,
      "Deleted invoice had an invalid amount, no adjustment needed",
      { ...metadata, amount: invoice.amount },
    );
    return false;
  }
  return true;
}
