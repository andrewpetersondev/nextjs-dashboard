import "server-only";
import type { InvoiceStatus } from "@/modules/invoices/domain/types";
import { moveBetweenBuckets } from "@/modules/revenues/domain/calculations/bucket-totals.calculation";
import { computeAggregateAfterAmountChange } from "@/modules/revenues/domain/calculations/revenue-aggregate.calculation";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import type { MetadataWithPeriod } from "@/modules/revenues/server/events/handlers/core/types";
import { updateRevenueRecord } from "@/modules/revenues/server/events/process-invoice/revenue-mutations";

interface Args {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly previousStatus: InvoiceStatus;
  readonly currentStatus: InvoiceStatus;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

/**
 * Handles switching between eligible statuses (paid <-> pending).
 * Keeps invoiceCount the same, adjusts totalAmount by the difference if any,
 * and moves value between paid/pending buckets accordingly.
 */
export async function handleEligibleStatusChange(args: Args): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentPaidTotal,
    currentPendingTotal,
    previousAmount,
    currentAmount,
    previousStatus,
    currentStatus,
    context,
    meta,
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
