import "server-only";

import {
  isEligibleDeletion as appIsEligibleDeletion,
  isInvoiceEligibleForRevenue as appIsInvoiceEligibleForRevenue,
} from "@/server/revenues/application/guards/invoice-eligibility.guard";
import type { LogMetadata } from "@/server/revenues/application/logging";
import type { InvoiceDto } from "@/shared/invoices/dto";

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
