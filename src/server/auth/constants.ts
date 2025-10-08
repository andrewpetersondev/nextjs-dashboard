// File: src/server/auth/constants.ts
import "server-only";

// encryption
export const SALT_ROUNDS = 10 as const;

// cookie
export const SESSION_COOKIE_NAME = "session" as const;
export const SESSION_COOKIE_PATH = "/" as const;
export const SESSION_COOKIE_SAMESITE = "lax" as const;
export const SESSION_COOKIE_HTTPONLY = true as const;
export const SESSION_COOKIE_SECURE_FALLBACK = false as const; // overridden by env in session.ts

// logging
export const LOGGER_CONTEXT_SESSION = "auth.session.establish";
