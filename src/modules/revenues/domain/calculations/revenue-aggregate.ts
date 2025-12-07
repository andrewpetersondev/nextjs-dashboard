/**
 * Aggregate data for revenue calculations.
 */
export type RevenueAggregate = Readonly<{
  readonly invoiceCount: number;
  readonly totalAmount: number;
}>;

/**
 * Computes the aggregate when adding an eligible invoice.
 * @param currentCount - Current invoice count.
 * @param currentTotal - Current total amount.
 * @param addedAmount - Amount to add.
 * @returns Updated aggregate.
 */
export function computeAggregateAfterAdd(
  currentCount: number,
  currentTotal: number,
  addedAmount: number,
): RevenueAggregate {
  return {
    invoiceCount: currentCount + 1,
    totalAmount: currentTotal + addedAmount,
  } as const;
}

/**
 * Computes the aggregate when removing an invoice that is no longer eligible.
 * Applies a floor at 0 to avoid negative values.
 * @param existingCount - Existing invoice count.
 * @param existingTotal - Existing total amount.
 * @param removedAmount - Amount to remove.
 * @returns Updated aggregate.
 */
export function computeAggregateAfterRemoval(
  existingCount: number,
  existingTotal: number,
  removedAmount: number,
): RevenueAggregate {
  return {
    invoiceCount: Math.max(0, existingCount - 1),
    totalAmount: Math.max(0, existingTotal - removedAmount),
  } as const;
}

/**
 * Computes the aggregate when the amount of an already-eligible invoice changes.
 * Note: No clamping is applied here to preserve existing behavior.
 * @param currentCount - Current invoice count.
 * @param currentTotal - Current total amount.
 * @param previousAmount - Previous amount.
 * @param currentAmount - New amount.
 * @returns Updated aggregate.
 */
export function computeAggregateAfterAmountChange(
  currentCount: number,
  currentTotal: number,
  previousAmount: number,
  currentAmount: number,
): RevenueAggregate {
  const amountDifference = currentAmount - previousAmount;
  return {
    invoiceCount: currentCount,
    totalAmount: currentTotal + amountDifference,
  } as const;
}
