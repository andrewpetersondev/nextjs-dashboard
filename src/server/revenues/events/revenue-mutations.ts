import "server-only";

import { type LogMetadata, logInfo } from "@/server/revenues/events/logging";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import { toRevenueId } from "@/shared/brands/domain-brands";

/**
 * Arguments for updating a revenue record.
 * @remarks
 * Use this object to keep the public API within max-params constraints and
 * ensure strict, self-documented typing.
 */
export type UpdateRevenueArgs = Readonly<{
  /** Revenue id to update (string form) */
  readonly revenueId: string;
  /** New invoice count for the period */
  readonly invoiceCount: number;
  /** New total revenue amount for the period */
  readonly totalAmount: number;
  /** Logging context */
  readonly context: string;
  /** Optional structured metadata for logs */
  readonly metadata?: LogMetadata;
}>;

/**
 * Updates a revenue record with new invoice count and revenue values
 */
export async function updateRevenueRecord(
  revenueService: RevenueService,
  args: UpdateRevenueArgs,
): Promise<void> {
  const { revenueId, invoiceCount, totalAmount, context, metadata } = args;

  logInfo(context, "Updating revenue record", {
    invoiceCount,
    revenueId,
    totalAmount,
    ...metadata,
  });

  await revenueService.update(toRevenueId(revenueId), {
    calculationSource: "invoice_event",
    invoiceCount,
    totalAmount,
  });
}
