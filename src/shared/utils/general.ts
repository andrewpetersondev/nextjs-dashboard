import {
  CENTS_IN_DOLLAR,
  ELLIPSIS,
  FIRST_PAGE,
  PAGINATION_END_EDGE_OFFSET,
  PAGINATION_SMALL_THRESHOLD,
  PAGINATION_START_EDGE,
  SECOND_PAGE,
  THIRD_PAGE,
  USD_CURRENCY,
  USD_LOCALE,
} from "@/shared/types/types";

export const formatCurrency = (amount: number): string => {
  return (amount / CENTS_IN_DOLLAR).toLocaleString(USD_LOCALE, {
    currency: USD_CURRENCY,
    style: "currency",
  });
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
    ),
  );
};

export const generatePagination = (
  currentPage: number,
  totalPages: number,
): (string | number)[] => {
  if (totalPages <= PAGINATION_SMALL_THRESHOLD) {
    return Array.from(
      { length: totalPages },
      (_: unknown, i: number): number => i + FIRST_PAGE,
    );
  }

  if (currentPage <= PAGINATION_START_EDGE) {
    return [
      FIRST_PAGE,
      SECOND_PAGE,
      THIRD_PAGE,
      ELLIPSIS,
      totalPages - 1,
      totalPages,
    ];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - PAGINATION_END_EDGE_OFFSET) {
    return [
      FIRST_PAGE,
      SECOND_PAGE,
      ELLIPSIS,
      totalPages - PAGINATION_END_EDGE_OFFSET,
      totalPages - 1,
      totalPages,
    ];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    FIRST_PAGE,
    ELLIPSIS,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    ELLIPSIS,
    totalPages,
  ];
};
