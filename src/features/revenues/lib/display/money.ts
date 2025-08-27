import {
  CENTS_IN_DOLLAR,
  type Cents,
  type Dollars,
} from "@/shared/money/money";

/**
 * Converts monetary values from database cents to display dollars.
 */
export function convertCentsToDollars(cents: Cents): Dollars {
  return Math.round(cents / CENTS_IN_DOLLAR);
}
