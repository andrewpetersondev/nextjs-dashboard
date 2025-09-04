import "server-only";

import { logInfo } from "@/server/revenues/application/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import { computeAggregateAfterAdd } from "@/server/revenues/domain/revenue-aggregate";
import type { MetadataWithPeriod } from "@/server/revenues/events/common/types";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";

interface Args {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentAmount: number;
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
    currentAmount,
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
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
  });
}
