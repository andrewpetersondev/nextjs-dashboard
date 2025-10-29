/**
 * Configuration constants for seeding operations.
 */
export const SEED_CONFIG = {
  demoCounterMax: 100,
  demoCounterMin: 1,
  firstDayOfMonth: 1,
  generateMonthlyPeriodsCount: 19,
  invoiceCount: 70,
  invoiceRegularThreshold: 0.9,
  invoiceStatusPendingProbability: 0.5,
  largeAmountThreshold: 1_500_001,
  maxAmountCents: 1_500_000,
  maxLargeAmountCents: 5_000_000,
  minAmountCents: 500,
  minAmountProbability: 0.1,
  minMonth: 1,
  monthsInYear: 12,
  saltRounds: 10,
  singleCentAmount: 1,
  singleCentProbability: 0.05,
  zeroAmountProbability: 0.05,
} as const;
