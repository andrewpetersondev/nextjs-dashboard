import "server-only";

import { logInfo } from "@/server/revenues/application/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import { computeAggregateAfterRemoval } from "@/server/revenues/domain/revenue-aggregate";
import type { MetadataWithPeriod } from "@/server/revenues/events/common/types";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";

interface Args {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly previousAmount: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod & {
    readonly existingCount: number;
    readonly existingTotal: number;
  };
}

export async function handleTransitionFromEligibleToIneligible(
  args: Args,
): Promise<void> {
  const { revenueService, revenueId, previousAmount, context, meta } = args;
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
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
  });
}
