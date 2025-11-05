export const DEFAULT_MASK = "***REDACTED***" as const;
export const DEFAULT_MAX_DEPTH = 4 as const;
export const PARTIAL_MASK_VISIBLE_EMAIL_CHARS = 1 as const;
export const PARTIAL_MASK_MIN_LENGTH = 16 as const;
export const PARTIAL_MASK_VISIBLE_START_CHARS = 4 as const;
export const PARTIAL_MASK_VISIBLE_END_CHARS = 4 as const;
export const CIRCULAR_REF_PLACEHOLDER = "[Circular]" as const;
export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Sensitive key identifiers (case-insensitive).
 * Extend cautiously; avoid over-redaction that obscures diagnostics.
 */
export const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  "password",
  "pass",
  "pwd",
  "key",
  "credential",
  "session",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "apiKey",
  "api_key",
  "clientSecret",
  "privateKey",
  "email",
] as const;
