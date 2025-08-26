import type { Cents, Dollars } from "@/shared/types/money";

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
