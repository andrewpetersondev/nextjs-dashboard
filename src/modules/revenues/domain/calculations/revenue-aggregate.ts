export type RevenueAggregate = Readonly<{
  readonly invoiceCount: number;
  readonly totalAmount: number;
}>;

/**
 * Computes the aggregate when adding an eligible invoice.
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
