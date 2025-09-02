/** Milliseconds unit alias for readability. */
export type Milliseconds = number;

/** Common duration constants (ms) for Cypress timeouts. */
export const ONE_SECOND: Milliseconds = 1000;
export const TWO_SECONDS: Milliseconds = 2000;
export const FIVE_SECONDS: Milliseconds = 5000;
export const TEN_SECONDS: Milliseconds = 10_000;
export const TWENTY_SECONDS: Milliseconds = 20_000;

/** Default timeout used in .should assertions unless specified otherwise. */
export const DEFAULT_TIMEOUT: Milliseconds = TEN_SECONDS;

export const DB_TIMEOUT: Milliseconds = TEN_SECONDS;
