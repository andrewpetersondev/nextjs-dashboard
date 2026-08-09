/** Locale for currency formatting — fixed, since the app ships one locale. */
export const USD_LOCALE = "en-US";

/** ISO 4217 code passed to `Intl.NumberFormat`. */
export const USD_CURRENCY = "USD";

/**
 * Divisor converting stored cents to display dollars.
 *
 * Money is persisted and passed around as integer cents; it becomes a decimal
 * only at the formatting boundary, so float arithmetic never touches a balance.
 */
export const CENTS_IN_DOLLAR = 100;
