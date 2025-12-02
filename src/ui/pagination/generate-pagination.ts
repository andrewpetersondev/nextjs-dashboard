import {
  ELLIPSIS,
  FIRST_PAGE,
  PAGINATION_END_EDGE_OFFSET,
  PAGINATION_SMALL_THRESHOLD,
  PAGINATION_START_EDGE,
  SECOND_PAGE,
  THIRD_PAGE,
} from "@/ui/pagination/pagination.constants";

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
