import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { periodKey } from "@/modules/revenues/domain/time/period";
import type { LogMetadata } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { ProcessOptions } from "@/modules/revenues/server/events/shared/types";
import { upsertRevenue } from "@/modules/revenues/server/events/shared/upsert-revenue";
import { withErrorHandling } from "@/modules/revenues/server/infrastructure/errors/error-handling";
import type { Period } from "@/shared/branding/brands";

/**
 * Processes an invoice for revenue calculation (Upsert operation).
 * Handles both new invoices (create) and updates to existing invoices (diffing).
 */
export async function processInvoiceUpsert(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: Period,
  options?: ProcessOptions,
): Promise<void> {
  const context =
    options?.context ?? "RevenueEventHandler.processInvoiceUpsert";
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
