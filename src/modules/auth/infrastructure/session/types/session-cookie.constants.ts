/**
 * Session cookie constants.
 */

/**
 * The name of the session cookie.
 */
export const SESSION_COOKIE_NAME = "session" as const;

/**
 * Whether the session cookie is HttpOnly.
 */
export const SESSION_COOKIE_HTTPONLY = true as const;

/**
 * The path for which the session cookie is valid.
 */
export const SESSION_COOKIE_PATH = "/" as const;

/**
 * The SameSite attribute for the session cookie.
 */
export const SESSION_COOKIE_SAMESITE = "strict" as const;
