import "server-only";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { periodKey } from "@/features/revenues/domain/period";
import { extractAndValidatePeriod } from "@/server/revenues/application/policies/invoice-period.policy";
import type {
  MetadataBase,
  MetadataWithPeriod,
  PeriodArg,
} from "@/server/revenues/events/handlers/core/types";

/**
 * Extracts and validates the period and builds metadata with period string.
 * Returns null when the period is not derivable (policy guard).
 */
export function preparePeriodAndMeta(
  currentInvoice: InvoiceDto,
  context: string,
  baseMeta: MetadataBase,
): { readonly period: PeriodArg; readonly meta: MetadataWithPeriod } | null {
  const period = extractAndValidatePeriod(currentInvoice, context);
  if (!period) {
    return null;
  }
  const meta: MetadataWithPeriod = { ...baseMeta, period: periodKey(period) };
  return { meta, period } as const;
}
