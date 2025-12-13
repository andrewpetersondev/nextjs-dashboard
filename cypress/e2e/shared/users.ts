/**
 * Utility functions for generating test user data in Cypress E2E tests.
 * Provides consistent user creation across different test scenarios.
 */
import {
  USER_ROLE,
  type UserRole,
} from "../../../src/modules/auth/domain/user/auth.roles";
import { E2E_ID_MODULUS, type TestUser } from "./auth-forms";

/**
 * Readonly credentials for a pre-seeded demo account (used in certain tests or docs).
 * Not to be confused with a generated TestUser used during signup.
 */
export interface DemoAccount {
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
  readonly username: string;
}

export const DEMO_USER = {
  email: "user@user.com",
  password: "UserPassword123!",
  role: USER_ROLE,
  username: "user",
} as const satisfies DemoAccount;

/**
 * Generates a unique test user with timestamp-based identifiers.
 */
export function createTestUser(): TestUser {
  const timestamp = Date.now() % E2E_ID_MODULUS;

  return {
    email: `e2e_${timestamp}@example.com`,
    password: "Password123!",
    timestamp,
    username: `e2e_user_${timestamp}`,
  } as const as TestUser;
}
