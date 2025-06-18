import type { Revenue, YAxisResult } from "@/src/lib/definitions/revenue";

// Note: Utility functions should use const (arrow functions) for better performance and readability.

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

export const generateYAxis = (revenue: Revenue[]): YAxisResult => {
	const yAxisLabels: string[] = [];
	const highestRecord: number = Math.max(
		...revenue.map((month: Revenue) => month.revenue),
	);
	const topLabel: number = Math.ceil(highestRecord / 1000) * 1000;

	for (let i: number = topLabel; i >= 0; i -= 100000) {
		yAxisLabels.push(`$${i / 1000}K`);
	}

	return { topLabel, yAxisLabels };
};
