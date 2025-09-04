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
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export async function handleEligibleAmountChange(args: Args): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    previousAmount,
    currentAmount,
    context,
    meta,
  } = args;
  const amountDifference = currentAmount - previousAmount;
  logInfo(
    context,
    "Invoice amount changed while remaining eligible for revenue",
    { ...meta, amountDifference, currentAmount, previousAmount },
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: currentCount,
    metadata: meta,
    revenueId,
    totalAmount: currentTotal + amountDifference,
  });
}
