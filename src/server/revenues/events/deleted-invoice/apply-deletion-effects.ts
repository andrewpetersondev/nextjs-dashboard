import "server-only";

import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import { computeAggregateAfterRemoval } from "@/server/revenues/domain/revenue-aggregate";
import { applyDeltaToBucket } from "@/server/revenues/domain/revenue-buckets";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";
import type { LogMetadata } from "../../application/logging";
import { logInfo } from "../../application/logging";

/**
 * Options required to apply deletion effects to revenue records.
 */
export type ApplyDeletionOptions = Readonly<{
  revenueService: RevenueService;
  invoice: InvoiceDto;
  period: Period;
  context: string;
  metadata: LogMetadata;
}>;

/**
 * Applies deletion effects to revenue records.
 * - If there is no existing revenue record for the period, it logs a message and returns.
 * - If there is an existing revenue record, it updates the invoice count and revenue amount accordingly.
 */
export async function applyDeletionEffects(
  options: ApplyDeletionOptions,
): Promise<void> {
  const { revenueService, invoice, period, context, metadata } = options;
  const existingRevenue = await revenueService.findByPeriod(period);
  if (!existingRevenue) {
    logInfo(
      context,
      "No existing revenue record was found for a period",
      metadata,
    );
    return;
  }
  const aggregate = computeAggregateAfterRemoval(
    existingRevenue.invoiceCount,
    existingRevenue.totalAmount,
    invoice.amount,
  );
  if (aggregate.invoiceCount === 0) {
    logInfo(context, "No more invoices for a period, deleting revenue record", {
      ...metadata,
      revenueId: existingRevenue.id,
    });
    await revenueService.delete(existingRevenue.id);
    return;
  }
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: existingRevenue.totalPaidAmount,
      totalPendingAmount: existingRevenue.totalPendingAmount,
    },
    invoice.status,
    -invoice.amount,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata,
    revenueId: existingRevenue.id,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
}
