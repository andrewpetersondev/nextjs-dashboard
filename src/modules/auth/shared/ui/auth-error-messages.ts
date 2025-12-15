/** biome-ignore-all lint/style/useNamingConvention: <keep for now> */

/**
 * Standardized error messages for authentication flows.
 *
 * @remarks
 * Use these constants for consistent user-facing error messages.
 * Prevents message duplication and ensures unified UX.
 */
export const AUTH_ERROR_MESSAGES = {
  DEMO_USER_FAILED: "Failed to create demo user. Please try again.",
  LOGIN_FAILED: "Invalid credentials. Please try again.",
  SIGNUP_FAILED: "Signup failed. Please try again.",
} as const;
