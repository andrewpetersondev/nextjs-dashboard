import "server-only";
import { logInfo } from "@/modules/revenues/application/cross-cutting/logging";
import { applyDeltaToBucket } from "@/modules/revenues/domain/calculations/bucket-totals";
import { computeAggregateAfterRemoval } from "@/modules/revenues/domain/calculations/revenue-aggregate";
import { updateRevenueRecord } from "@/modules/revenues/events/shared/revenue-mutations";
import type { HandleEligibleToIneligibleArgs } from "@/modules/revenues/events/updated-invoice/types";

/**
 * Handles transitions from eligible to ineligible status.
 */
export async function handleEligibleToIneligible(
  args: HandleEligibleToIneligibleArgs,
): Promise<void> {
  const {
    context,
    currentPaidTotal,
    currentPendingTotal,
    meta,
    previousAmount,
    previousStatus,
    revenueId,
    revenueService,
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
