import "server-only";

/**
 * Converts cents to dollars for display purposes
 * Business logic conversion separate from database operations
 */
export function convertCentsToDollars(cents: number): number {
  return Math.round(cents / 100);
}

/**
 * Get current year as default fallback
 * Provides a consistent way to get the current year across revenue operations
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
