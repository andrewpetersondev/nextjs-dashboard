"use client";

// Note: Utility functions should use const (arrow functions) for better performance and readability.

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
