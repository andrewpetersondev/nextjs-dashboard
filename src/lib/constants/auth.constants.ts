// import "server-only";

// update: when this file is server-only, e2e tests will not run because the Node.js and Next.js environments are different. how to fix this? set the value in the .env file instead? use a shared, environment-agnostic configuration file?
/**
 * One day in milliseconds.
 */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Session duration in milliseconds (7 days).
 */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * JWT expiration string for jose (7 days).
 */
export const JWT_EXPIRATION = "7d";

/**
 * Name of the session cookie.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 */
export const SESSION_COOKIE_NAME = "session";

export const SALT_ROUNDS: number = 10;
