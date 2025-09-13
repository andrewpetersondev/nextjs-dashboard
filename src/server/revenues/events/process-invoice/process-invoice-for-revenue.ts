import "server-only";

import type { InvoiceDto } from "@/features/invoices/dto/dto";
import { periodKey } from "@/features/revenues/domain/period";
import type { LogMetadata } from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { upsertRevenue } from "@/server/revenues/events/process-invoice/upsert-revenue";
import { withErrorHandling } from "@/server/revenues/shared/errors/error-handling";
import type { Period } from "@/shared/domain/domain-brands";

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
