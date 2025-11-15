import "server-only";
import {
  type LogMetadata,
  logInfo,
} from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { toRevenueId } from "@/shared/branding/id-converters";

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
  /** New total paid amount for the period */
  readonly totalPaidAmount: number;
  /** New total pending amount for the period */
  readonly totalPendingAmount: number;
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
  const {
    revenueId,
    invoiceCount,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
    context,
    metadata,
  } = args;

  logInfo(context, "Updating revenue record", {
    invoiceCount,
    revenueId,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
    ...metadata,
  });

  await revenueService.update(toRevenueId(revenueId), {
    calculationSource: "invoice_event",
    invoiceCount,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
  });
}
