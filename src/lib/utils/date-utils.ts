/**
 * Returns the current date in ISO format (YYYY-MM-DD).
 * This is useful for setting default values in forms or APIs.
 *
 * @returns {string} The current date as a string in ISO format.
 */
export function getCurrentIsoDate(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/**
 * Formats a date string into a localized date representation.
 * The output format will show the day (numeric), month (short name), and year (numeric).
 *
 * @param dateStr - The date string to format (should be parseable by the Date constructor)
 * @param locale - The locale string to use for formatting (defaults to "en-US")
 * @returns A formatted date string in the specified locale
 *
 * @example
 * ```typescript
 * formatDateToLocal("2025-08-12") // Returns "Aug 12, 2025" for en-US locale
 * formatDateToLocal("2025-08-12", "de-DE") // Returns "12. Aug. 2025" for German locale
 * ```
 */
export const formatDateToLocal = (
  dateStr: string,
  locale = "en-US",
): string => {
  const date: Date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
    locale,
    options,
  );
  return formatter.format(date);
};

/**
 * Converts a date to the first day of the same month.
 * @param date - The input date
 * @returns A new Date object representing the first day of the month
 */
export function toFirstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Validates if a Date object is valid and represents a real date.
 * @param date - The Date object to validate
 * @returns true if the date is valid, false otherwise
 */
export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
