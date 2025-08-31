/**
 * Common error message patterns asserted in E2E tests.
 */
export const ERROR_MESSAGES = {
  FAILED_AUTH_FORM: /Failed to validate form data/i,
  INVALID_CREDENTIALS: /Invalid email or password/i,
  INVALID_FILE_TYPE: /Invalid file type/i,
  ITEM_ALREADY_EXISTS: /Item already exists/i,
  RATE_LIMIT_EXCEEDED: /Rate limit exceeded/i,
} as const satisfies Readonly<Record<string, RegExp>>;
