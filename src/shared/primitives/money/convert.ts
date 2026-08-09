import {
	CENTS_IN_DOLLAR,
	USD_CURRENCY,
	USD_LOCALE,
} from "@/shared/primitives/money/money.constants";

const COMPACT_MAX_FRACTION_DIGITS = 1;

/**
 * Format a number into a USD currency string.
 * Converts an amount in cents to USD and formats it as a currency string.
 */
export const formatCurrency = (amount: number): string => {
	return (amount / CENTS_IN_DOLLAR).toLocaleString(USD_LOCALE, {
		currency: USD_CURRENCY,
		style: "currency",
	});
};

/**
 * Format cents as a short currency string — `$60K` rather than `$60,000.00`.
 *
 * For axis ticks and other places where the exact figure is available elsewhere
 * and the full string would not fit. Never use it where the precise amount is
 * the point: the chart's screen-reader table uses {@link formatCurrency}.
 */
export const formatCompactCurrency = (amount: number): string => {
	return (amount / CENTS_IN_DOLLAR).toLocaleString(USD_LOCALE, {
		currency: USD_CURRENCY,
		maximumFractionDigits: COMPACT_MAX_FRACTION_DIGITS,
		notation: "compact",
		style: "currency",
	});
};
