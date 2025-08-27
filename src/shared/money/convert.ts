import {
  CENTS_IN_DOLLAR,
  type Cents,
  type Dollars,
  USD_CURRENCY,
  USD_LOCALE,
} from "@/shared/money/types";

/**
 * Converts monetary values from database cents to display dollars.
 * Shared location so both server and features can use it without crossing boundaries.
 */
export function convertCentsToDollars(cents: Cents): Dollars {
  return Math.round(cents / CENTS_IN_DOLLAR);
}

/**
 * Format a number into a USD currency string.
 * Converts an amount in cents to USD and formats it as a currency string.
 */
export const formatCurrency = (amount: number): string => {
  return (amount / CENTS_IN_DOLLAR).toLocaleString(USD_LOCALE, {
    currency: USD_CURRENCY,
    style: "currency",
  });
};
