import "server-only";
import type { InvoiceStatus } from "@/modules/invoices/domain/types";
import { applyDeltaToBucket } from "@/modules/revenues/domain/calculations/bucket-totals.calculation";
import { computeAggregateAfterAmountChange } from "@/modules/revenues/domain/calculations/revenue-aggregate.calculation";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import { updateRevenueRecord } from "@/modules/revenues/server/events/process-invoice/revenue-mutations";
import type { MetadataWithPeriod } from "@/modules/revenues/server/events/updated-invoice/types";

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
