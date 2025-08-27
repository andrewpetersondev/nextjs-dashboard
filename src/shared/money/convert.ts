import {
  CENTS_IN_DOLLAR,
  type Cents,
  type Dollars,
  USD_CURRENCY,
  USD_LOCALE,
} from "@/shared/money/money";

/**
 * Converts monetary values from database cents to display dollars.
 * Shared location so both server and features can use it without crossing boundaries.
 *
 * @param cents - Monetary value in cents (database format)
 * @returns Monetary value in dollars, rounded to nearest whole dollar
 */
export function convertCentsToDollars(cents: Cents): Dollars {
  // biome-ignore lint/style/noMagicNumbers: <math>
  return Math.round(cents / 100);
}

export const formatCurrency = (amount: number): string => {
  return (amount / CENTS_IN_DOLLAR).toLocaleString(USD_LOCALE, {
    currency: USD_CURRENCY,
    style: "currency",
  });
};
