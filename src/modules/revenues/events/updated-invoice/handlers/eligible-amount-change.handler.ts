import "server-only";
import { applyDeltaToBucket } from "@/modules/revenues/domain/calculations/bucket-totals";
import { computeAggregateAfterAmountChange } from "@/modules/revenues/domain/calculations/revenue-aggregate";
import { updateRevenueRecord } from "@/modules/revenues/events/shared/revenue-mutations";
import type { HandleEligibleAmountChangeArgs } from "@/modules/revenues/events/updated-invoice/types";

/**
 * Handles amount changes for eligible invoices.
 */
export async function handleEligibleAmountChange(
  args: HandleEligibleAmountChangeArgs,
): Promise<void> {
  const {
    context,
    currentAmount,
    currentCount,
    currentPaidTotal,
    currentPendingTotal,
    currentStatus,
    currentTotal,
    meta,
    previousAmount,
    revenueId,
    revenueService,
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
