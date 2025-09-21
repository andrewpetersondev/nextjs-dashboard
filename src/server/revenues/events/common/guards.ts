import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { LogMetadata } from "@/server/revenues/application/cross-cutting/logging";
import {
  isEligibleDeletion as appIsEligibleDeletion,
  isInvoiceEligibleForRevenue as appIsInvoiceEligibleForRevenue,
} from "@/server/revenues/application/guards/invoice-eligibility.guard";

/**
 * Compatibility shim preserved under events/common to avoid breaking changes.
 * Delegates to application-level guard to comply with DDD layering.
 */
export function isInvoiceEligibleForRevenue(
  invoice: InvoiceDto,
  contextMethod: string,
): boolean {
  return appIsInvoiceEligibleForRevenue(invoice, contextMethod);
}

export function isEligibleDeletion(
  invoice: InvoiceDto,
  context: string,
  metadata: LogMetadata,
): boolean {
  return appIsEligibleDeletion(invoice, context, metadata);
}
