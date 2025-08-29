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
