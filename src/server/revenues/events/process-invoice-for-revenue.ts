import "server-only";

import { withErrorHandling } from "@/server/revenues/events/error-handling";
import type { LogMetadata } from "@/server/revenues/events/logging";
import { upsertRevenue } from "@/server/revenues/events/process-invoice/upsert-revenue";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";
import { periodKey } from "@/shared/revenues/period";

/**
 * Options for processing an invoice for revenue.
 * - isUpdate: when true, indicates this call is for an updated invoice and may include previousAmount for diffing.
 */
type ProcessOptions = Readonly<{
  context?: string;
  isUpdate?: boolean;
  previousAmount?: number;
}>;

/**
 * Processes an invoice for revenue calculation
 */
export async function processInvoiceForRevenue(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: Period,
  options?: ProcessOptions,
): Promise<void> {
  const context =
    options?.context ?? "RevenueEventHandler.processInvoiceForRevenue";
  const isUpdate = options?.isUpdate ?? false;
  const previousAmount = options?.previousAmount;
  const metadata: LogMetadata = {
    invoice: invoice.id,
    isUpdate,
    period: periodKey(period),
  };
  await withErrorHandling(
    context,
    "Processing invoice for revenue calculation",
    () =>
      upsertRevenue({
        context,
        invoice,
        isUpdate,
        metadata,
        period,
        previousAmount,
        revenueService,
      }),
    metadata,
  );
}
