// src/shared/errors/redaction/redaction.constants.ts

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
 *
 * Used for both:
 * - Error context redaction (BaseError)
 * - Log payload redaction (Logger)
 *
 * These keys are redacted wherever they appear to prevent credential leakage.
 * Extend cautiously; avoid over-redaction that obscures diagnostics.
 */
export const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  "accessToken",
  "apiKey",
  "api_key",
  "authorization",
  "clientSecret",
  "credential",
  "key",
  "pass",
  "password",
  "privateKey",
  "pwd",
  "refreshToken",
  "secret",
  "session",
  "stack",
  "token",
] as const;

/**
 * Additional keys to redact specifically in error contexts.
 *
 * These are typically internal implementation details that:
 * - Are safe to log at trace level but not in errors
 * - Contain stack traces already handled elsewhere
 * - May leak architectural details
 */
export const ERROR_CONTEXT_SENSITIVE_KEYS: readonly string[] = [
  ...DEFAULT_SENSITIVE_KEYS,
  // Add error-specific keys here if needed
] as const;

/**
 * Additional keys to redact specifically in log payloads.
 *
 * These might include:
 * - Internal headers that are safe in errors but not logs
 * - Session cookies
 * - Query strings with sensitive params
 */
export const LOG_PAYLOAD_SENSITIVE_KEYS: readonly string[] = [
  ...DEFAULT_SENSITIVE_KEYS,
  "cookie",
  "cookies",
  "set-cookie",
] as const;
