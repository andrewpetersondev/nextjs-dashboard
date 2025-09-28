import { isValid } from "date-fns";

/**
 * Safe Date validator combining instanceof check with date-fns isValid.
 */
export function isDateValid(value: unknown): value is Date {
  return value instanceof Date && isValid(value);
}
