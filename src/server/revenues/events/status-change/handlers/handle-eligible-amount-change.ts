import "server-only";

import type { InvoiceStatus } from "@/features/invoices/dto/types";
import { logInfo } from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { applyDeltaToBucket } from "@/server/revenues/domain/calculations/bucket-totals.calculation";
import { computeAggregateAfterAmountChange } from "@/server/revenues/domain/calculations/revenue-aggregate.calculation";
import type { MetadataWithPeriod } from "@/server/revenues/events/common/types";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";

interface Args {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly currentStatus: InvoiceStatus;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export async function handleEligibleAmountChange(args: Args): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentPaidTotal,
    currentPendingTotal,
    previousAmount,
    currentAmount,
    currentStatus,
    context,
    meta,
  } = args;
  const amountDifference = currentAmount - previousAmount;
  logInfo(
    context,
    "Invoice amount changed while remaining eligible for revenue",
    { ...meta, amountDifference, currentAmount, previousAmount },
  );
  const aggregate = computeAggregateAfterAmountChange(
    currentCount,
    currentTotal,
    previousAmount,
    currentAmount,
  );
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    currentStatus,
    amountDifference,
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
