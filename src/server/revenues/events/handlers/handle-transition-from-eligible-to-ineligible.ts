import "server-only";
import type { InvoiceStatus } from "@/features/invoices/lib/types";
import { logInfo } from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { applyDeltaToBucket } from "@/server/revenues/domain/calculations/bucket-totals.calculation";
import { computeAggregateAfterRemoval } from "@/server/revenues/domain/calculations/revenue-aggregate.calculation";
import type { MetadataWithPeriod } from "@/server/revenues/events/handlers/core/types";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";

interface Args {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly previousAmount: number;
  readonly previousStatus: InvoiceStatus;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod & {
    readonly existingCount: number;
    readonly existingTotal: number;
  };
}

export async function handleTransitionFromEligibleToIneligible(
  args: Args,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    previousAmount,
    previousStatus,
    currentPaidTotal,
    currentPendingTotal,
    context,
    meta,
  } = args;
  logInfo(
    context,
    "Invoice no longer eligible for revenue, removing from the total",
    meta,
  );
  const aggregate = computeAggregateAfterRemoval(
    meta.existingCount,
    meta.existingTotal,
    previousAmount,
  );
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    previousStatus,
    -previousAmount,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
}
