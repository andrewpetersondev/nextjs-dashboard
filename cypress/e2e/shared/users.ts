/**
 * Utility functions for generating test user data in Cypress E2E tests.
 * Provides consistent user creation across different test scenarios.
 */
import { E2E_ID_MODULUS, type TestUser } from "./auth-forms";

/**
 * Generates a unique test user with timestamp-based identifiers.
 *
 * @returns TestUser object with unique username, email, and secure password
 */
export function createTestUser(): TestUser {
  const timestamp = Date.now() % E2E_ID_MODULUS;

  return {
    email: `e2e_${timestamp}@example.com`,
    password: "P@ssw0rd!123", // meets zod requirements: length, letter, number, special
    timestamp,
    username: `e2e_user_${timestamp}`,
  } as const as TestUser;
}
