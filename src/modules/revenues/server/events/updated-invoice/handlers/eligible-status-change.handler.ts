import "server-only";
import { moveBetweenBuckets } from "@/modules/revenues/domain/calculations/bucket-totals";
import { computeAggregateAfterAmountChange } from "@/modules/revenues/domain/calculations/revenue-aggregate";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import { updateRevenueRecord } from "@/modules/revenues/server/events/shared/revenue-mutations";
import type { HandleEligibleStatusChangeArgs } from "@/modules/revenues/server/events/updated-invoice/types";

/**
 * Handles switching between eligible statuses (paid <-> pending).
 * Keeps invoiceCount the same, adjusts totalAmount by the difference if any,
 * and moves value between paid/pending buckets accordingly.
 */
export async function handleEligibleStatusChange(
  args: HandleEligibleStatusChangeArgs,
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
    previousStatus,
    revenueId,
    revenueService,
  } = args;

  const amountDifference = currentAmount - previousAmount;

  logInfo(context, "Invoice status switched between eligible states", {
    ...meta,
    amountDifference,
    currentAmount,
    currentStatus,
    previousAmount,
    previousStatus,
  });

  const aggregate = computeAggregateAfterAmountChange(
    currentCount,
    currentTotal,
    previousAmount,
    currentAmount,
  );

  const nextBuckets = moveBetweenBuckets(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    {
      currentAmount,
      fromStatus: previousStatus,
      previousAmount,
      toStatus: currentStatus,
    },
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
