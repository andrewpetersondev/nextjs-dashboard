/**
 * Modulus used to keep generated E2E identifiers reasonably short and unique-enough per run.
 * Adjust as needed to balance uniqueness vs readability in test logs.
 * @remarks Used by users.ts when generating timestamp-based IDs.
 */
export const E2E_ID_MODULUS = 99_999_999 as const;

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

// Standard invalid credentials for negative auth tests
export const INVALID_EMAIL: string = "invalid@example.com";
export const INVALID_PASSWORD: string = "wrongpassword";
