/**
 * Common success message patterns asserted in E2E tests.
 */
export const SUCCESS_MESSAGES = {
  USER_SUSPENDED: /User suspended successfully/i,
} as const satisfies Readonly<Record<string, RegExp>>;
