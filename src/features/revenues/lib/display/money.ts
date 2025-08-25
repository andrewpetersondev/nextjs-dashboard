import type { Cents, Dollars } from "@/shared/types/money";

/**
 * Converts monetary values from database cents to display dollars.
 *
 * @param cents - Monetary value in cents (database format)
 * @returns Monetary value in dollars, rounded to nearest whole dollar
 */
export function convertCentsToDollars(cents: Cents): Dollars {
  return Math.round(cents / 100);
}
