/**
 * Session timing constants.
 *
 * All timing values centralized for audit and tuning.
 */
export const SESSION_COOKIE_NAME = "session" as const;
export const SESSION_COOKIE_HTTPONLY = true as const;
export const SESSION_COOKIE_PATH = "/" as const;
export const SESSION_COOKIE_SAMESITE = "strict" as const;
