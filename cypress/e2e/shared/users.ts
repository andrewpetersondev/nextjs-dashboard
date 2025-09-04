/**
 * Utility functions for generating test user data in Cypress E2E tests.
 * Provides consistent user creation across different test scenarios.
 */
import { E2E_ID_MODULUS, type TestUser } from "./auth-forms";

/**
 * Role of demo accounts that exist in seed data.
 */
export type DemoRole = "admin" | "user" | "guest";

/**
 * Readonly credentials for a pre-seeded demo account (used in certain tests or docs).
 * Not to be confused with a generated TestUser used during signup.
 */
export interface DemoAccount {
  readonly email: string;
  readonly password: string;
  readonly username: string;
  readonly role: DemoRole;
}

export const DEMO_USER = {
  email: "user@user.com",
  password: "UserPassword123!",
  role: "user",
  username: "user",
} as const satisfies DemoAccount;

export const DEMO_ADMIN = {
  email: "admin@admin.com",
  password: "AdminPassword123!",
  role: "admin",
  username: "admin",
} as const satisfies DemoAccount;

export const DEMO_GUEST = {
  email: "guest@guest.com",
  password: "GuestPassword123!",
  role: "guest",
  username: "guest",
} as const satisfies DemoAccount;

/**
 * Generates a unique test user with timestamp-based identifiers.
 *
 * @returns TestUser object with unique username, email, and secure password
 */
export function createTestUser(): TestUser {
  const timestamp = Date.now() % E2E_ID_MODULUS;

  return {
    email: `e2e_${timestamp}@example.com`,
    password: "Password123!", // meets zod requirements: length, letter, number, special
    timestamp,
    username: `e2e_user_${timestamp}`,
  } as const as TestUser;
}
