// Note: Utility functions should use const (arrow functions) for better performance and readability.

import type { SimpleRevenueDto } from "@/features/revenues/revenue.dto";

interface YAxisResult {
  yAxisLabels: string[];
  topLabel: number;
}

export const formatCurrency = (amount: number): string => {
  return (amount / 100).toLocaleString("en-US", {
    currency: "USD",
    style: "currency",
  });
};

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

export const generateYAxis = (revenue: SimpleRevenueDto[]): YAxisResult => {
  const yAxisLabels: string[] = [];
  const highestRecord: number = Math.max(
    ...revenue.map((month: SimpleRevenueDto) => month.revenue),
  );
  const topLabel: number = Math.ceil(highestRecord / 1000) * 1000;

  for (let i: number = topLabel; i >= 0; i -= 100000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { topLabel, yAxisLabels };
};

// Delete properties whose values match ANY of the given conditions
export const stripProperties = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>,
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, v]) =>
        v !== undefined && // Ignore undefined
        v !== null && // Ignore null
        v !== "" && // Ignore empty string
        v !== false, // Ignore boolean false
      // You can add or remove conditions as needed!
    ),
  );
};

export const generatePagination = (
  currentPage: number,
  totalPages: number,
): (string | number)[] => {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_: unknown, i: number): number => i + 1,
    );
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

/**
 * Returns the current date in ISO format (YYYY-MM-DD).
 * This is useful for setting default values in forms or APIs.
 *
 * @returns {string} The current date as a string in ISO format.
 */
export function getCurrentIsoDate(): string {
  return new Date().toISOString().split("T")[0] as string;
}
