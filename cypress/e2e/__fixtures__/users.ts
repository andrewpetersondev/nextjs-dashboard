/**
 * Utility functions for generating test user data in Cypress E2E tests.
 * Provides consistent user creation across different test scenarios.
 */
import { dividerOrModulus } from "./constants";

export interface TestUser {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly timestamp: number;
}

/**
 * Generates a unique test user with timestamp-based identifiers.
 *
 * @returns TestUser object with unique username, email, and secure password
 */
export function createTestUser(): TestUser {
  const timestamp = Date.now() % dividerOrModulus;

  return {
    email: `e2e_${timestamp}@example.com`,
    password: "P@ssw0rd!123", // meets zod requirements: length, letter, number, special
    timestamp,
    username: `e2e_user_${timestamp}`,
  } as const;
}

/**
 * Creates a test user with a custom suffix for specific test scenarios.
 *
 * @param suffix - Custom suffix to append to the base identifiers
 * @returns TestUser object with custom suffix
 */
export function createTestUserWithSuffix(suffix: string): TestUser {
  const timestamp = Date.now() % dividerOrModulus;

  return {
    email: `e2e_${timestamp}_${suffix}@example.com`,
    password: "P@ssw0rd!123",
    timestamp,
    username: `e2e_user_${timestamp}_${suffix}`,
  } as const;
}
