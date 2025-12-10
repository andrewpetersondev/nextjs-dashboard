/**
 * Returns the current date in ISO format (YYYY-MM-DD).
 * Useful for setting default values in forms or APIs.
 * @returns The current date as an ISO date string
 */
export function getCurrentIsoDate(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/**
 * Formats an invoice date string into a localized representation.
 * @param dateStr - The ISO date string to format
 * @param locale - The locale for formatting (defaults to "en-US")
 * @returns Formatted date string in the specified locale
 * @example
 * formatInvoiceDateLocalized("2025-08-12") // Returns "Aug 12, 2025"
 */
export function formatInvoiceDateLocalized(
  dateStr: string,
  locale = "en-US",
): string {
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
}
