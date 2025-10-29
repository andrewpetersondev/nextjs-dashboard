import "server-only";

import { isValid, parseISO } from "date-fns";
import { ISO_YEAR_MONTH_REGEX } from "@/features/invoices/lib/constants";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { dateToPeriod } from "@/features/revenues/domain/period";
import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";

/**
 * Domain policy: safely extract the Period (first-of-month DATE) from an invoice date.
 * Pure function without logging or application concerns.
 */
export function extractPeriodFromInvoice(invoice: InvoiceDto): Period | null {
  if (!invoice?.date) {
    return null;
  }

  try {
    const parsedDate = parseISO(invoice.date);
    if (isValid(parsedDate)) {
      return dateToPeriod(parsedDate);
    }
    if (invoice.date.match(ISO_YEAR_MONTH_REGEX)) {
      const testDate = parseISO(`${invoice.date}-01`);
      if (isValid(testDate)) {
        return toPeriod(invoice.date);
      }
    }

    return null;
  } catch {
    // Pure domain: swallow and return null; caller can log at application layer.
    return null;
  }
}

/**
 * Domain policy: validate minimal invoice fields and ability to extract a period.
 * Pure result with reason; no logging here by design.
 */
export function validateInvoicePeriodForRevenue(
  invoice: InvoiceDto | undefined,
): { readonly valid: boolean; readonly reason?: string } {
  if (!invoice) {
    return { reason: "Invoice is undefined", valid: false } as const;
  }

  if (!invoice.id) {
    return { reason: "Invoice ID is missing", valid: false } as const;
  }

  if (!invoice.date) {
    return { reason: "Invoice date is missing", valid: false } as const;
  }

  if (!invoice.status) {
    return { reason: "Invoice status is missing", valid: false } as const;
  }

  const period = extractPeriodFromInvoice(invoice);
  if (!period) {
    return {
      reason: "Could not extract a valid period from the invoice date",
      valid: false,
    } as const;
  }

  return { valid: true } as const;
}
