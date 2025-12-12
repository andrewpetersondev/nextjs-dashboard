import "server-only";

/**
 * Type guard to validate demo user counter values.
 *
 * @param counter - The counter value to validate.
 * @returns True if counter is a positive number, false otherwise.
 *
 * @remarks
 * Ensures counter is:
 * - Not null or undefined
 * - A valid number
 * - Greater than zero
 */
export function isValidDemoUserCounter(
  counter: number | null | undefined,
): counter is number {
  return typeof counter === "number" && counter > 0;
}
