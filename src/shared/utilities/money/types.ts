/**
 * Money unit aliases to make dollars vs cents explicit at type level.
 * These are plain number aliases (non-branded) to keep the refactor minimal
 * while still documenting intent throughout the codebase.
 */
export type Cents = number;
export type Dollars = number;

export const USD_LOCALE = "en-US";
export const USD_CURRENCY = "USD";
export const CENTS_IN_DOLLAR = 100;
