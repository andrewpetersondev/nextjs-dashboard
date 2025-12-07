import type { InvoiceStatus } from "@/modules/invoices/domain/types";

/**
 * Moves value between buckets when status changes between eligible states.
 * Also supports amount change during the move.
 */
type MoveBetweenArgs = Readonly<{
  readonly currentAmount: number;
  readonly fromStatus: InvoiceStatus;
  readonly previousAmount: number;
  readonly toStatus: InvoiceStatus;
}>;

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

export type BucketTotals = Readonly<{
  readonly totalPaidAmount: number;
  readonly totalPendingAmount: number;
}>;

/**
 * Applies a delta to the appropriate bucket given invoice status.
 * Positive delta adds; negative delta subtracts.
 */
export function applyDeltaToBucket(
  current: BucketTotals,
  status: InvoiceStatus,
  delta: number,
): BucketTotals {
  if (status === "paid") {
    return {
      totalPaidAmount: clampNonNegative(current.totalPaidAmount + delta),
      totalPendingAmount: current.totalPendingAmount,
    } as const;
  }
  if (status === "pending") {
    return {
      totalPaidAmount: current.totalPaidAmount,
      totalPendingAmount: clampNonNegative(current.totalPendingAmount + delta),
    } as const;
  }
  // For ineligible statuses, no bucket change
  return current;
}

/**
 * Moves value between buckets when status changes between eligible states.
 * Also supports amount change during the move.
 */
export function moveBetweenBuckets(
  current: BucketTotals,
  args: MoveBetweenArgs,
): BucketTotals {
  const { currentAmount, fromStatus, previousAmount, toStatus } = args;
  let next: BucketTotals = current;
  // remove previous amount from the originating bucket
  next = applyDeltaToBucket(next, fromStatus, -previousAmount);
  // add current amount to the target bucket
  next = applyDeltaToBucket(next, toStatus, currentAmount);
  return next;
}
