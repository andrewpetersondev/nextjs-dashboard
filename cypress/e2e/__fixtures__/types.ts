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
