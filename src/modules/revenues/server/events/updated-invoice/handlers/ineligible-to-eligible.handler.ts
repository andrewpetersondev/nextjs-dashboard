import "server-only";
import { applyDeltaToBucket } from "@/modules/revenues/domain/calculations/bucket-totals";
import { computeAggregateAfterAdd } from "@/modules/revenues/domain/calculations/revenue-aggregate";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import { updateRevenueRecord } from "@/modules/revenues/server/events/shared/revenue-mutations";
import type { HandleIneligibleToEligibleArgs } from "@/modules/revenues/server/events/updated-invoice/types";

/**
 * Handles transitions from ineligible to eligible status.
 */
export async function handleIneligibleToEligible(
  args: HandleIneligibleToEligibleArgs,
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
    revenueId,
    revenueService,
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
