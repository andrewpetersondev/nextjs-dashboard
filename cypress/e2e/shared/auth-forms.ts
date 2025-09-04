/**
 * Modulus used to keep generated E2E identifiers reasonably short and unique-enough per run.
 * Adjust as needed to balance uniqueness vs readability in test logs.
 * @remarks Used by users.ts when generating timestamp-based IDs.
 */
export const E2E_ID_MODULUS = 99_999_999 as const;

// Standard invalid credentials for negative auth tests
export const INVALID_EMAIL: string = "invalid@example.com";
export const INVALID_PASSWORD: string = "wrongpassword";

/**
 * Common error message patterns asserted in E2E tests.
 */
export const ERROR_MESSAGES = {
  FAILED_AUTH_FORM: /Failed to validate form data/i,
  INVALID_CREDENTIALS: /Invalid email or password/i,
} as const satisfies Readonly<Record<string, RegExp>>;

/**
 * Credentials for signing up a user in E2E tests.
 * @public
 */
export type SignupCreds = {
  /** Username to create for the new account. */
  readonly username: string;
  /** Email address for the account. */
  readonly email: string;
  /** Plain-text password meeting the app's validation rules. */
  readonly password: string;
};

/**
 * Credentials for logging into an existing user account.
 * @public
 */
export type LoginCreds = {
  /** Email address for login. */
  readonly email: string;
  /** Plain-text password for login. */
  readonly password: string;
};

/**
 * Canonical shape of a generated test user used in E2E flows.
 * @public
 */
export interface TestUser {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  /** Timestamp used to correlate entities created during a single E2E run. */
  readonly timestamp: number;
}
