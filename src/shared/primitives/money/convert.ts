import {
	CENTS_IN_DOLLAR,
	USD_CURRENCY,
	USD_LOCALE,
} from "@/shared/primitives/money/money.constants";

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
