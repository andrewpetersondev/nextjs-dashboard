import "server-only";

import { isValid, parseISO } from "date-fns";
import { dateToPeriod } from "@/features/revenues/lib/date/period";
import type { InvoiceDto } from "@/server/invoices/dto";
import { logError, logInfo } from "@/server/revenues/events/logging";
import { type Period, toPeriod } from "@/shared/brands/domain-brands";
import type { InvoiceStatus } from "@/shared/types/invoices";

const matchingRegex = /^\d{4}-\d{2}$/;

/**
 * Safely extracts the Period (first-of-month DATE) from an invoice date.
 */
export function extractPeriodFromInvoice(invoice: InvoiceDto): Period | null {
  if (!invoice || !invoice.date) {
    return null;
  }

  try {
    // Handle different date formats
    // Try to parse as ISO date
    const parsedDate = parseISO(invoice.date);
    if (isValid(parsedDate)) {
      return dateToPeriod(parsedDate);
    }
    if (invoice.date.match(matchingRegex)) {
      // Add a day to make it a complete date for validation
      const testDate = parseISO(`${invoice.date}-01`);
      if (isValid(testDate)) {
        return toPeriod(invoice.date);
      }
    }

    return null;
  } catch (error) {
    logError("extractPeriodFromInvoice", "Failed to extract period", error, {
      invoiceDate: invoice.date,
      invoiceId: invoice.id,
    });
    return null;
  }
}

/**
 * Checks if an invoice status is eligible for revenue
 */
export function isStatusEligibleForRevenue(status: InvoiceStatus): boolean {
  return status === "paid" || status === "pending";
}

/**
 * Validates an invoice for revenue calculations.
 */
export function validateInvoiceForRevenue(invoice: InvoiceDto | undefined): {
  valid: boolean;
  reason?: string;
} {
  if (!invoice) {
    return { reason: "Invoice is undefined", valid: false };
  }

  if (!invoice.id) {
    return { reason: "Invoice ID is missing", valid: false };
  }

  if (!invoice.date) {
    return { reason: "Invoice date is missing", valid: false };
  }

  if (!invoice.status) {
    return { reason: "Invoice status is missing", valid: false };
  }

  const period = extractPeriodFromInvoice(invoice);
  if (!period) {
    return {
      reason: "Could not extract a valid period from the invoice date",
      valid: false,
    };
  }

  return { valid: true };
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
    const validationResult = validateInvoiceForRevenue(invoice);

    if (!validationResult.valid) {
      logInfo(
        context,
        `Invoice not eligible for revenue: ${validationResult.reason}`,
        {
          invoice: invoice.id,
          reason: validationResult.reason,
        },
      );
      return false;
    }

    // Check if the invoice has a valid amount
    if (!invoice.amount || invoice.amount <= 0) {
      logInfo(context, "Invoice has zero or negative amount, skipping", {
        invoice: invoice.id,
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
      invoice: invoice.id,
    });
    return false;
  }
}

/**
 * Extracts and validates the period from an invoice
 */
export function extractAndValidatePeriod(
  invoice: InvoiceDto,
  context: string,
  eventId?: string,
): Period | null {
  const period = extractPeriodFromInvoice(invoice);

  if (!period) {
    logError(
      context,
      "Failed to extract period from the invoice",
      new Error("Invalid invoice date"),
      {
        eventId,
        invoiceDate: invoice.date,
        invoiceId: invoice.id,
      },
    );
    return null;
  }

  return period;
}
