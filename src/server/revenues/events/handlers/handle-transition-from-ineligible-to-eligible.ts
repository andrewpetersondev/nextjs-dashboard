import "server-only";
import type { InvoiceStatus } from "@/features/invoices/domain/types";
import { logInfo } from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { applyDeltaToBucket } from "@/server/revenues/domain/calculations/bucket-totals.calculation";
import { computeAggregateAfterAdd } from "@/server/revenues/domain/calculations/revenue-aggregate.calculation";
import type { MetadataWithPeriod } from "@/server/revenues/events/handlers/core/types";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";

interface Args {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly currentAmount: number;
  readonly currentStatus: InvoiceStatus;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export async function handleTransitionFromIneligibleToEligible(
  args: Args,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentPaidTotal,
    currentPendingTotal,
    currentAmount,
    currentStatus,
    context,
    meta,
  } = args;
  logInfo(
    context,
    "Invoice now eligible for revenue, adding to the total",
    meta,
  );
  const aggregate = computeAggregateAfterAdd(
    currentCount,
    currentTotal,
    currentAmount,
  );
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    currentStatus,
    currentAmount,
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
