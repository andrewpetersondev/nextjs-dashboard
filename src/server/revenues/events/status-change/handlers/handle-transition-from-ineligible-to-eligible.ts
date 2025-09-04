import "server-only";

import { logInfo } from "@/server/revenues/application/logging";
import type { MetadataWithPeriod } from "@/server/revenues/events/common/types";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";

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
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: currentCount + 1,
    metadata: meta,
    revenueId,
    totalAmount: currentTotal + currentAmount,
  });
}
