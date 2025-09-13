import "server-only";

/**
 * Server-only authentication constants.
 * Keep security-sensitive values here to avoid leaking to the client.
 */
export const SALT_ROUNDS = 10 as const;

/**
 * Name of the session cookie set by the server.
 */
export const SESSION_COOKIE_NAME = "session" as const;
