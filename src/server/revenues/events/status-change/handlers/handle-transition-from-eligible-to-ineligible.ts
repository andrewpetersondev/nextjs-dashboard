import "server-only";

import { logInfo } from "@/server/revenues/events/logging";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { MetadataWithPeriod } from "../types";

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
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: Math.max(0, meta.existingCount - 1),
    metadata: meta,
    revenueId,
    totalAmount: Math.max(0, meta.existingTotal - previousAmount),
  });
}
