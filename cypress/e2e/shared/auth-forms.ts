/**
 * Modulus used to keep generated E2E identifiers reasonably short and unique-enough per run.
 * Adjust as needed to balance uniqueness vs readability in test logs.
 * @remarks Used by users.ts when generating timestamp-based IDs.
 */
export const E2E_ID_MODULUS = 99_999_999 as const;

// Standard invalid credentials for negative auth tests
export const INVALID_EMAIL: string = "invalid@example.com";
export const INVALID_PASSWORD: string = "wrongpassword";

export const E2E_EMAIL_PREFIX = "e2e_dbtest_";
export const E2E_USERNAME_PREFIX = "e2e_user_"; // kept for compatibility if referenced elsewhere
export const DEFAULT_E2E_PASSWORD = "Password123!";

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
  /** Desired username (display name). */
  username: string;
  /** User email address. */
  email: string;
  /** Plain-text password for test signup. */
  password: string;
};

/**
 * Canonical shape of a generated test user used in E2E flows.
 * @public
 */
export interface TestUser {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly timestamp: number;
}
